import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { S3Client } from '@aws-sdk/client-s3';
import { BehaviorSubject, Observable } from 'rxjs';
import { Upload } from '@aws-sdk/lib-storage';
import { environment } from '../../../environments/environment';

type Endpoint = 's3aws' | 's3mnt';
type UploadResult = { progress$: Observable<number>, url$: Observable<string> };

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private s3Clients: Record<Endpoint, S3Client>;

  constructor() {
    this.s3Clients = {
      s3aws: new S3Client({
        region: 'us-east-1', endpoint: environment.s3aws,
        credentials: { accessKeyId: 'miusuarioseguro', secretAccessKey: 'mipasswordsuperseguro' },
        forcePathStyle: true
      }),
      s3mnt: new S3Client({
        region: 'us-east-1', endpoint: environment.s3mnt,
        credentials: { accessKeyId: 'jseocampo', secretAccessKey: 'INBEMETAL2025*&' },
        forcePathStyle: true
      })
    };
  }

  public getS3Client(endpoint: Endpoint): S3Client {
    return this.s3Clients[endpoint];
  }

  private getObjectUrl(endpoint: Endpoint, bucket: string, key: string): string {
    const baseUrl = environment[endpoint].replace(/\/+$/, '');
    return `${baseUrl}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
  }

  private base64ToUint8Array(base64: string): { bytes: Uint8Array, mimeType: string } {
    const matches = base64.match(/^data:(.+);base64,(.*)$/);
    if (!matches) throw new Error('Base64 inválido');
    const binary = atob(matches[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, mimeType: matches[1] };
  }

  private uploadObject(bucket: string, endpoint: Endpoint,
    prepare: () => { key: string, body: Uint8Array | File, mimeType: string }): UploadResult {
    const progress = new BehaviorSubject<number>(0);
    const url = new BehaviorSubject<string>('');
    // Defer preparation so callers can subscribe before synchronous errors.
    Promise.resolve().then(async () => {
      const { key, body, mimeType } = prepare();
      const upload = new Upload({
        client: this.getS3Client(endpoint),
        params: { Bucket: bucket, Key: key, Body: body, ContentType: mimeType },
        queueSize: 4, partSize: 5 * 1024 * 1024, leavePartsOnError: false
      });
      upload.on('httpUploadProgress', p => {
        if (p.loaded && p.total) progress.next(Math.min(99, Math.round(p.loaded / p.total * 100)));
      });
      await upload.done();
      progress.next(100);
      url.next(this.getObjectUrl(endpoint, bucket, key));
      progress.complete();
      url.complete();
    }).catch(err => { progress.error(err); url.error(err); });
    return { progress$: progress.asObservable(), url$: url.asObservable() };
  }

  uploadBase64Image(base64: string, bucket: string, endpoint: Endpoint = 's3aws'): UploadResult {
    return this.uploadObject(bucket, endpoint, () => {
      const { bytes, mimeType } = this.base64ToUint8Array(base64);
      return { key: `img_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`, body: bytes, mimeType };
    });
  }

  uploadMediaFile(file: File, bucket: string, endpoint: Endpoint = 's3mnt'): UploadResult {
    return this.uploadObject(bucket, endpoint, () => {
      if (!file || !file.size) throw new Error('Archivo inválido');
      const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || 'bin').toLowerCase();
      const types: Record<string, string> = { jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp', heic:'image/heic', mp4:'video/mp4', webm:'video/webm', mov:'video/quicktime', m4v:'video/mp4', ogv:'video/ogg', '3gp':'video/3gpp' };
      const mimeType = file.type && file.type !== 'application/octet-stream' ? file.type : types[ext] || 'application/octet-stream';
      const prefix = mimeType.startsWith('video/') ? 'video' : 'img';
      const key = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
      return { key, body: file, mimeType };
    });
  }

  uploadToCertBucket(base64: string, cco: string, year: number, type: 'parcial'|'total', endpoint: Endpoint = 's3aws'): UploadResult {
    return this.uploadObject('cert', endpoint, () => ({
      key: `${cco}/${type}/${year}.pdf`, body: this.base64ToUint8Array(base64).bytes, mimeType: 'application/pdf'
    }));
  }

  async pickImage(): Promise<string | null> {
    try {
      const image = await this.getImageFromGallery();
      return await this.compressImage(image.dataUrl);
    } catch (error) { console.error('Error picking image:', error); return null; }
  }

  private async getImageFromGallery(): Promise<any> {
    return Camera.getPhoto({ quality: 10, width: 100, height: 100, allowEditing: false,
      resultType: CameraResultType.DataUrl, source: CameraSource.Photos });
  }

  private async compressImage(base64Image: string): Promise<string> {
    if (!base64Image || base64Image.length <= 100) throw new Error('No se ha seleccionado ninguna imagen válida');
    return this.reduceImageSize(base64Image);
  }

  private async reduceImageSize(base64Image: string): Promise<string> {
    return this.keepReducing(base64Image, 0.9);
  }

  private async keepReducing(base64Image: string, quality: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('Contexto de canvas no disponible.'); return; }
        canvas.width = img.width * 0.9;
        canvas.height = img.height * 0.9;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject('Error al cargar la imagen.');
      img.src = base64Image;
    });
  }

  async takePicture(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({ quality: 90, allowEditing: false,
        resultType: CameraResultType.Uri, source: CameraSource.Camera });
      return await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => this.resizeAndCompressImage(img).then(resolve, reject);
        img.onerror = () => reject('Error loading image');
        img.src = image.webPath as string;
      });
    } catch (error) { console.error('Error capturing the photo:', error); return null; }
  }

  private async resizeAndCompressImage(img: HTMLImageElement): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    canvas.width = img.width * 0.8;
    canvas.height = img.height * 0.8;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }
}























/*import { Injectable } from '@angular/core';*/
/*import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'; //lib Camera Capacitor*/
/*import { S3Client } from '@aws-sdk/client-s3';*/
/*import { BehaviorSubject, Observable } from 'rxjs';*/
/*import { Upload } from "@aws-sdk/lib-storage";*/
/*import { environment } from '../../../environments/environment';*/

/*@Injectable({*/
  /*providedIn: 'root'*/
/*})*/
/*export class PhotoService {*/

  /*private s3Clients: Record<'s3aws' | 's3mnt', S3Client>;*/

  /*constructor() {*/
    /*this.s3Clients = {*/
      /*s3aws: new S3Client({*/
        /*region: 'us-east-1',*/
        /*endpoint: environment.s3aws,*/
        /*credentials: {*/
          /*accessKeyId: 'miusuarioseguro',*/
          /*secretAccessKey: 'mipasswordsuperseguro',*/
        /*},*/
        /*forcePathStyle: true,*/
      /*}),*/
      /*s3mnt: new S3Client({*/
        /*region: 'us-east-1',*/
        /*endpoint: environment.s3mnt,*/
        /*credentials: {*/
          /*accessKeyId: 'jseocampo',*/
          /*secretAccessKey: 'INBEMETAL2025*&',*/
        /*},*/
        /*forcePathStyle: true,*/
      /*}),*/
    /*};*/
  /*}*/

  /*private getS3Client(endpoint: 's3aws' | 's3mnt'): S3Client {*/
    /*return this.s3Clients[endpoint];*/
  /*}*/

  /*private getObjectUrl(endpoint: 's3aws' | 's3mnt', bucket: string, key: string): string {*/
    /*const baseUrl = environment[endpoint].replace(/\/+$/, '');*/
    /*return `${baseUrl}/${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;*/
  /*}*/

  /*private base64ToUint8Array(base64: string): { bytes: Uint8Array, mimeType: string } {*/
    /*const matches = base64.match(/^data:(.+);base64,(.*)$/);*/
    /*if (!matches) throw new Error("Base64 inválido");*/
    /*const mimeType = matches[1];*/
    /*const base64Data = matches[2];*/
    /*const binary = atob(base64Data);*/
    /*const len = binary.length;*/
    /*const bytes = new Uint8Array(len);*/
    /*for (let i = 0; i < len; i++) {*/
      /*bytes[i] = binary.charCodeAt(i);*/
    /*}*/
    /*return { bytes, mimeType };*/
  /*}*/

  /*//DOCUMENTACION:*/
  /*[>Subir al servidor anterior:<]*/
  /*[>this.photoService.uploadBase64Image(<]*/
    /*[>base64,<]*/
    /*[>'imagenes',<]*/
    /*[>'s3aws'<]*/
  /*[>);<]*/

  /*[>Subir al nuevo MinIO mnio_mnt:<]*/
  /*[>this.photoService.uploadBase64Image(<]*/
    /*[>base64,<]*/
    /*[>'mntdev',<]*/
    /*[>'s3mnt'<]*/
  /*[>);<]*/

  /*uploadBase64Image(base64: string, bucket: string, endpoint: 's3aws' | 's3mnt' = 's3aws'): { progress$: Observable<number>, url$: Observable<string> } {*/
    /*console.log('bucket',bucket)*/
    /*console.log('endpoint',endpoint)*/
    /*console.log('base64',base64)*/
    /*const progressSubject = new BehaviorSubject<number>(0);*/
    /*const urlSubject = new BehaviorSubject<string>('');*/
    /*(async () => {*/
      /*try {*/
        /*const { bytes, mimeType } = this.base64ToUint8Array(base64);*/
        /*const key = `img_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;*/
        /*const parallelUploads3 = new Upload({*/
          /*client: this.getS3Client(endpoint),*/
          /*params: {*/
            /*Bucket: bucket,*/
            /*Key: key,*/
            /*Body: bytes,*/
            /*ContentType: mimeType*/
          /*},*/
          /*queueSize: 4,*/
          /*partSize: 1024 * 1024 * 5*/
        /*});*/
        /*parallelUploads3.on("httpUploadProgress", (progress) => {*/
          /*if (progress.loaded && progress.total) {*/
            /*const percent = Math.round((progress.loaded / progress.total) * 100);*/
            /*progressSubject.next(percent);*/
          /*}*/
        /*});*/
        /*await parallelUploads3.done();*/
        /*progressSubject.next(100);*/
        /*urlSubject.next(this.getObjectUrl(endpoint, bucket, key));*/
        /*progressSubject.complete();*/
        /*urlSubject.complete();*/
      /*} catch (err) {*/
        /*progressSubject.error(err);*/
        /*urlSubject.error(err);*/
      /*}*/
    /*})();*/
    /*return { progress$: progressSubject.asObservable(), url$: urlSubject.asObservable() };*/
  /*}*/



  /*uploadToCertBucket(*/
    /*base64:string,*/
    /*cco:string,*/
    /*year:number,*/
    /*type:'parcial'|'total',*/
    /*endpoint: 's3aws' | 's3mnt' = 's3aws'*/
  /*):{progress$:Observable<number>,url$:Observable<string>}{*/

    /*const progressSubject=new BehaviorSubject<number>(0);*/
    /*const urlSubject=new BehaviorSubject<string>('');*/

    /*(async()=>{*/

      /*try{*/

        /*const {bytes}=this.base64ToUint8Array(base64);*/

        /*const key=`${cco}/${type}/${year}.pdf`;*/

        /*const upload=new Upload({*/
          /*client:this.getS3Client(endpoint),*/
          /*params:{*/
            /*Bucket:'cert',*/
            /*Key:key,*/
            /*Body:bytes,*/
            /*ContentType:'application/pdf'*/
          /*},*/
          /*queueSize:4,*/
          /*partSize:1024*1024*5*/
        /*});*/

        /*upload.on('httpUploadProgress',p=>{*/
          /*if(p.loaded&&p.total)*/
            /*progressSubject.next(Math.round((p.loaded/p.total)*100));*/
        /*});*/

        /*await upload.done();*/

        /*progressSubject.next(100);*/
        /*urlSubject.next(this.getObjectUrl(endpoint, 'cert', key));*/

        /*progressSubject.complete();*/
        /*urlSubject.complete();*/

      /*}catch(err){*/

        /*progressSubject.error(err);*/
        /*urlSubject.error(err);*/

      /*}*/

    /*})();*/

    /*return{*/
      /*progress$:progressSubject.asObservable(),*/
      /*url$:urlSubject.asObservable()*/
    /*};*/

  /*}*/




  /*// Método para seleccionar una imagen desde la galería*/
  /*async pickImage(): Promise<string | null> {*/
    /*try {*/
      /*const image = await this.getImageFromGallery();*/
      /*const pickedImage = image.dataUrl; // La imagen seleccionada como cadena base64*/
      /*const compressedImage = await this.compressImage(pickedImage); // Iniciar compresión*/
      /*return compressedImage;*/
    /*} catch (error) {*/
      /*console.error('Error picking image: ', error);*/
      /*return null;*/
    /*}*/
  /*}*/

  /*// Método que gestiona la obtención de la imagen desde la galería*/
  /*private async getImageFromGallery(): Promise<any> {*/
    /*return await Camera.getPhoto({*/
      /*quality: 10,*/
      /*width: 100, // Ajustar el ancho deseado*/
      /*height: 100,*/
      /*allowEditing: false,*/
      /*resultType: CameraResultType.DataUrl, // Obtener la imagen como una URL base64*/
      /*source: CameraSource.Photos, // Seleccionar desde la galería*/
    /*});*/
  /*}*/

  /*// Método que gestiona la compresión de la imagen*/
  /*private async compressImage(base64Image: string): Promise<string> {*/
    /*if (base64Image && base64Image.length > 100) {*/
      /*return await this.reduceImageSize(base64Image); // Comprimir si la imagen es válida*/
    /*} else {*/
      /*throw new Error('No se ha seleccionado ninguna imagen válida');*/
    /*}*/
  /*}*/

  /*// Método para reducir el tamaño y la calidad de la imagen*/
  /*private async reduceImageSize(base64Image: string): Promise<string> {*/
    /*console.log('Imagen base original', base64Image.length);*/

    /*const quality = 0.9; // Reducir la calidad al 90%*/
    /*const finalImage = await this.keepReducing(base64Image, quality); // Guardar el resultado final*/
    /*console.log('Imagen comprimida', finalImage.length);*/
    /*return finalImage;*/
  /*}*/

  /*// Método que realiza la compresión efectiva de la imagen*/
  /*private async keepReducing(base64Image: string, quality: number): Promise<string> {*/
    /*const img = new Image();*/
    /*img.src = base64Image;*/

    /*return new Promise<string>((resolve, reject) => {*/
      /*img.onload = () => {*/
        /*const canvas = document.createElement('canvas');*/
        /*const ctx = canvas.getContext('2d');*/

        /*if (!ctx) {*/
          /*reject("Contexto de canvas no disponible.");*/
          /*return;*/
        /*}*/

        /*canvas.width = img.width * 0.9; // Redimensionar al 10%*/
        /*canvas.height = img.height * 0.9; // Redimensionar al 10%*/

        /*// Dibujar la imagen en el canvas con las nuevas dimensiones*/
        /*ctx.drawImage(img, 0, 0, canvas.width, canvas.height);*/
        /*// Obtener la imagen comprimida en formato base64 con la calidad ajustada*/
        /*const newBase64Image = canvas.toDataURL('image/jpeg', quality);*/
        /*resolve(newBase64Image);*/
      /*};*/
      /*img.onerror = () => {*/
        /*reject("Error al cargar la imagen.");*/
      /*};*/
    /*});*/
  /*}*/


    /*async takePicture(): Promise<string | null> {*/
      /*try {*/
        /*const image = await Camera.getPhoto({*/
          /*quality: 90,*/
          /*allowEditing: false,*/
          /*resultType: CameraResultType.Uri,*/
          /*source: CameraSource.Camera, // Usar la cámara*/
        /*});*/
        /*// Cargar la imagen usando la URI obtenida*/
        /*const img = new Image();*/
        /*img.src = image.webPath as string; // webPath es una URL temporal de la imagen*/
        /*// Espera a que la imagen cargue antes de procesarla*/
        /*const optimizedImage = await new Promise<string>((resolve, reject) => {*/
          /*img.onload = async () => {*/
            /*try {*/
              /*const result = await this.resizeAndCompressImage(img); // Comprimir y redimensionar la imagen*/
              /*resolve(result); // Devuelve la imagen comprimida*/
            /*} catch (error) {*/
              /*reject('Error during image processing');*/
            /*}*/
          /*};*/
          /*img.onerror = () => reject('Error loading image');*/
        /*});*/
        /*return optimizedImage;*/
      /*} catch (error) {*/
        /*console.error('Error capturing the photo:', error);*/
        /*return null; // En caso de error, devuelve null*/
      /*}*/
    /*}*/

    /*// Redimensiona y comprime la imagen*/
    /*private async resizeAndCompressImage(img: HTMLImageElement): Promise<string> {*/
      /*const canvas = document.createElement('canvas');*/
      /*const ctx = canvas.getContext('2d');*/
      /*if (!ctx) {*/
        /*console.error('Canvas context not available.');*/
        /*return '';*/
      /*}*/
      /*const originalWidth = img.width;*/
      /*const originalHeight = img.height;*/
      /*const targetWidth = originalWidth * 0.8; // Reducir al 10% del tamaño original*/
      /*const targetHeight = originalHeight * 0.8; // Reducir al 10% del tamaño original*/
      /*// Establecer las nuevas dimensiones en el canvas*/
      /*canvas.width = targetWidth;*/
      /*canvas.height = targetHeight;*/
      /*// Dibujar la imagen en el canvas*/
      /*ctx.drawImage(img, 0, 0, targetWidth, targetHeight);*/
      /*// Retornar la imagen comprimida como base64 con una calidad del 90%  */
      /*return canvas.toDataURL('image/jpeg', 0.9); // 0.9 es la calidad (90%) //es diferente del los demas parametros de compresion */
    /*}*/



/*}*/
