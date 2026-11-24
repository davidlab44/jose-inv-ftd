import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';

/** Uses the SAME configured S3Client as PhotoService; do not create another client with credentials in the UI. */
export class StreamUpload {
  private uploadId = '';
  private key = '';
  private parts: { ETag: string; PartNumber: number }[] = [];
  private pending: Blob[] = [];
  private pendingBytes = 0;
  private chain: Promise<void> = Promise.resolve();
  private partNumber = 0;
  private failed: any = null;
  private closed = false;
  private readonly minPart = 5 * 1024 * 1024;
  constructor(private client: S3Client, private bucket: string, private onBytes: (bytes: number) => void) {}
  async start(): Promise<void> {
    this.key = `video/${Date.now()}-${Math.random().toString(36).slice(2)}.webm`;
    const r = await this.client.send(new CreateMultipartUploadCommand({ Bucket: this.bucket, Key: this.key, ContentType: 'video/webm' }));
    if (!r.UploadId) throw new Error('MinIO no devolvió UploadId');
    this.uploadId = r.UploadId;
  }
  append(blob: Blob): void {
    if (this.closed || this.failed || !blob.size) return;
    this.pending.push(blob); this.pendingBytes += blob.size;
    if (this.pendingBytes >= this.minPart) this.flush(false);
  }
  private flush(final: boolean): void {
    if (!this.pendingBytes || (!final && this.pendingBytes < this.minPart)) return;
    const body = new Blob(this.pending, { type: 'video/webm' });
    this.pending = []; this.pendingBytes = 0;
    const number = ++this.partNumber;
    this.chain = this.chain.then(async () => {
      if (this.failed) throw this.failed;
      const bytes = new Uint8Array(await body.arrayBuffer());
      const r = await this.client.send(new UploadPartCommand({ Bucket: this.bucket, Key: this.key, UploadId: this.uploadId, PartNumber: number, Body: bytes, ContentLength: bytes.byteLength }));
      if (!r.ETag) throw new Error('MinIO no devolvió ETag');
      this.parts.push({ ETag: r.ETag, PartNumber: number }); this.onBytes(bytes.byteLength);
    }).catch(err => { this.failed = err; });
  }
  async finish(): Promise<string> {
    this.closed = true; this.flush(true);
    await this.chain;
    if (this.failed) throw this.failed;
    if (!this.parts.length) throw new Error('La grabación no produjo datos');
    await this.client.send(new CompleteMultipartUploadCommand({ Bucket: this.bucket, Key: this.key, UploadId: this.uploadId, MultipartUpload: { Parts: this.parts } }));
    const endpoint = await this.client.config.endpoint();
    const base = `${endpoint.protocol}//${endpoint.hostname}${endpoint.port ? ':' + endpoint.port : ''}`;
    return `${base.replace(/\/$/, '')}/${encodeURIComponent(this.bucket)}/${this.key.split('/').map(encodeURIComponent).join('/')}`;
  }
  async abort(): Promise<void> {
    this.closed = true;
    await this.chain;
    if (this.uploadId) await this.client.send(new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: this.key, UploadId: this.uploadId }));
  }
}
