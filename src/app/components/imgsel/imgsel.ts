import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PhotoService } from '../../services/asset/photo.service';
import { Subscription } from 'rxjs';
import { StreamUpload } from './stream-upload';
@Component({selector:'app-imgsel', templateUrl:'./imgsel.html', styleUrls:['./imgsel.scss']})
export class ImgselComponent implements OnDestroy {
 @Input() images: string[] = [];
 @Input() disabled = false;
 @Output() imagesChange = new EventEmitter<string[]>();
 @Output() busyChange = new EventEmitter<boolean>();
 busy = false; progress = 0; error = ''; recording = false; bytes = 0;
 private readonly bucket = 'mntdev';
 private subs = new Subscription();
 private stream: MediaStream | null = null;
 private recorder: MediaRecorder | null = null;
 private live: StreamUpload | null = null;
 private destroyed = false;
 constructor(private photo: PhotoService) {}
 private setBusy(value: boolean) { this.busy = value; this.busyChange.emit(value); }
 private add(url: string) { if (!this.destroyed) { this.images = [...this.images, url]; this.imagesChange.emit(this.images); } }
 remove(url: string) { if (!this.busy && !this.disabled) { this.images = this.images.filter(x => x !== url); this.imagesChange.emit(this.images); } }
 isVideo(url: string) { return /\.(mp4|webm|mov|m4v|ogv|ogg|3gp)(?:[?#]|$)/i.test(url); }
 private upload(result: any): Promise<void> {
   return new Promise((resolve,reject) => {
     const progress = result.progress$.subscribe({next:(p:number)=>this.progress=p,error:()=>{}});
     this.subs.add(progress);
     let url = '';
     this.subs.add(result.url$.subscribe({next:(value:string)=>{ if (typeof value === 'string' && /^https?:\/\//i.test(value)) url=value; }, error:(err:any)=>{progress.unsubscribe();reject(err);}, complete:()=>{progress.unsubscribe(); if (!url) reject(new Error('Sin URL')); else {this.add(url);resolve();}}}));
   });
 }
 async photoFrom(source: 'camera'|'gallery') {
   if (this.busy || this.disabled) return;
   this.setBusy(true); this.error=''; this.progress=0;
   try { const data = source==='camera' ? await this.photo.takePicture() : await this.photo.pickImage();
     if (data && !this.destroyed) await this.upload(this.photo.uploadBase64Image(data, this.bucket, 's3mnt'));
   } catch(e) { this.error='No se pudo subir la fotografía.'; } finally {this.setBusy(false);}
 }
 async files(event: Event) {
   const input=event.target as HTMLInputElement; const files=Array.from(input.files || []); input.value='';
   if (!files.length || this.busy || this.disabled) return;
   this.setBusy(true); this.error='';
   const failed: string[]=[];
   try { for (const file of files) { if (this.destroyed) break; this.progress=0;
     try { if (!/^(image|video)\//i.test(file.type) && !/\.(jpg|jpeg|png|gif|webp|heic|mp4|webm|mov|m4v|ogv|3gp)$/i.test(file.name)) throw new Error('Formato inválido');
       await this.upload(this.photo.uploadMediaFile(file, this.bucket, 's3mnt'));
     } catch(e) {failed.push(file.name);} }
   } finally {this.error=failed.length ? 'No se cargaron: '+failed.join(', ')+'. Puedes volver a seleccionarlos.' : ''; this.setBusy(false);}
 }
 async startRecording() {
   if (this.busy || this.disabled) return;
   this.setBusy(true); this.error=''; this.bytes=0;
   try {
     const client=this.photo.getS3Client('s3mnt');
     if (!client) throw new Error('PhotoService requiere getS3Client(s3mnt).');
     const mime=['video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
     if (!mime) throw new Error('Grabación WebM no disponible.');
     this.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:true});
     if (this.destroyed) {this.cleanup();return;}
     this.live=new StreamUpload(client,this.bucket,n=>this.bytes+=n); await this.live.start();
     if (this.destroyed) {await this.live.abort();this.cleanup();return;}
     this.recorder=new MediaRecorder(this.stream,{mimeType:mime,videoBitsPerSecond:1500000});
     this.recorder.ondataavailable=e=>this.live?.append(e.data);
     this.recorder.onerror=()=>{void this.stopRecording();};
     this.recorder.start(2000); this.recording=true;
   } catch(e) {this.error=e instanceof Error ? e.message : 'No se pudo grabar'; if(this.live) await this.live.abort().catch(()=>{});this.cleanup();this.setBusy(false);}
 }
 async stopRecording() {
   if (!this.recording || !this.recorder) return;
   this.recording=false;
   try { const r=this.recorder; if(r.state!=='inactive') await new Promise<void>((resolve,reject)=>{r.addEventListener('stop',()=>resolve(),{once:true});r.addEventListener('error',()=>reject(new Error('Grabación fallida')),{once:true});r.stop();});
     this.stream?.getTracks().forEach(t=>t.stop()); if(this.live) this.add(await this.live.finish());
   } catch(e) {this.error='No se pudo finalizar el video.';if(this.live) await this.live.abort().catch(()=>{});}
   finally {this.cleanup();this.setBusy(false);}
 }
 private cleanup() {this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;this.live=null;this.recording=false;}
 ngOnDestroy() {this.destroyed=true;this.subs.unsubscribe();if(this.recorder && this.recorder.state!=='inactive') this.recorder.stop();if(this.live) void this.live.abort().catch(()=>{});this.cleanup();}
}
