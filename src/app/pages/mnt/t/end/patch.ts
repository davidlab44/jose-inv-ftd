import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { PhotoService } from '../../../../services/asset/photo.service';
import { TService } from '../../../../services/mnt/t.service';
import { Router } from '@angular/router';
import { DateService } from '../../../../services/local/date.service';
interface PhotoEntry { img: string; date: string; status: string; note: string; pending?: boolean; replacesUrl?: string; saving?: boolean; dirty?: boolean; }
interface Annotation { type: 'point' | 'circle' | 'arrow'; x1: number; y1: number; x2?: number; y2?: number; }

@Component({ selector: 'page-patch', templateUrl: 'patch.html', styleUrls: ['./patch.scss'] })
export class PatchPage {

  @Input() images: string[] = [];
  @Output() imagesChange = new EventEmitter<string[]>();
  @Input() maxImages = 10;
  @Input() bucket = 'mntdev';
  task: any;
  uploading = false;
  uploadProgress = 0;
  errorMessage = '';
  photoEntries: PhotoEntry[] = [];
  saving = false;
  showObservations = false;
  observations = '';
  // Las fotografías nuevas se agrupan en una única entrada de data.end.
  selectedUrl: string | null = null;
  modalPreviewSrc: string | null = null;
  viewerOpen = false;
  editorMode = false;
  noteModalOpen = false;
  notePhoto: PhotoEntry | null = null;
  selectedPhoto: PhotoEntry | null = null;
  savingEdited = false;
  previewsByUrl: Record<string, string> = {};
  brokenImages: Record<string, boolean> = {};
  activeTool: 'point' | 'circle' | 'arrow' = 'point';
  annotations: Annotation[] = [];
  private annotationsByUrl: Record<string, Annotation[]> = {};
  private dragStart: { x: number; y: number } | null = null;
  draftEnd: { x: number; y: number } | null = null;

  constructor(private router: Router, 
              private photoService: PhotoService,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              private tService: TService,
              private dateService: DateService, 
             ) {
    const navigation = this.router.getCurrentNavigation();
    console.log("Item recibido en patch:", navigation);
    const item = this.router.getCurrentNavigation()?.extras?.state?.item;
    if (item) {
      this.task = item;
      this.task.uiDate = this.task.data?.datein;
      // La lista @Input() sigue siendo la fuente principal de imágenes.
    }
    console.log('item recibido router',item)
    this.task=item;
  }

  get canAdd(): boolean { return !this.uploading && !this.saving && !this.savingEdited && this.photoEntries.filter(e => e.pending && e.status === 'c').length < this.maxImages; }
  get pendingCount(): number { return this.photoEntries.filter(e => e.pending).length; }
  get orderedPhotos(): PhotoEntry[] { return this.photoEntries.filter(e => e.status === 'c').sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)); }
  private now(): string { return this.dateService.getDate(); }
  private refreshImages(): void { this.setImages(this.photoEntries.filter(e => e.status === 'c').map(e => e.img)); }


  ngOnInit(){
    this.loadTaskById();
  }

  imagenes:any[]=[];
  loadTaskById(){
    console.log('entro a loadTaskById')
    this.tService.getOne(this.task.id).subscribe({ 
      next: (res) => {      
        this.task=res[0];
        console.log('single task :', this.task);  
        // data.end contiene grupos {date, imgs: string[], status, note}.
        const end = this.task?.data?.end;
        const entries: PhotoEntry[] = [];
        if (Array.isArray(end)) {
          end.forEach((item: any) => {
            if (!item || typeof item !== 'object' || item.status !== 'c') return;
            const urls = Array.isArray(item.imgs) ? item.imgs : [];
            urls.forEach((url: any) => {
              if (typeof url === 'string' && url) entries.push({
                img: url, date: item.date || '', status: 'c', note: item.note || ''
              });
            });
          });
        }
        this.photoEntries = entries;
        this.refreshImages();
        console.log('imgs IMGS', this.imagenes)
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }

  async addImage(): Promise<void> {
    if (!this.canAdd) return;
    console.log('imgs3',this.imagenes);
    const sheet = await this.actionSheetController.create({
      header: 'Agregar fotografía',
      buttons: [
        { text: 'Tomar foto', icon: 'camera-outline', handler: () => { void this.upload('camera'); } },
        { text: 'Elegir de galería', icon: 'images-outline', handler: () => { void this.upload('gallery'); } },
        { text: 'Cancelar', icon: 'close', role: 'cancel' }
      ]
    });
    await sheet.present();
  }


async upload(source: 'camera' | 'gallery'): Promise<void> {
  if (!this.canAdd) return;
  this.uploading = true;
  this.uploadProgress = 0;
  this.errorMessage = '';
  try {
    const base64 = source === 'camera'
      ? await this.photoService.takePicture()
      : await this.photoService.pickImage();
    if (!base64) return;
    this.showObservations = true;
    console.log('[Fotografía] Imagen seleccionada.');
    console.log('[Fotografía] Bucket:', this.bucket);
    console.log('[Fotografía] Endpoint: s3mnt');
    const { progress$, url$ } =
      this.photoService.uploadBase64Image(base64, this.bucket, 's3mnt');
    console.log('[Fotografía] Servicio uploadBase64Image iniciado.');
    const progressSub = progress$.subscribe({
      next: (p: number) => {
        this.uploadProgress = p;
        console.log(`[Fotografía] Progreso: ${p}%`);
      },
      error: err => {
        console.error('[Fotografía] Error de progreso:', err);
      },
      complete: () => {
        console.log('[Fotografía] Observable progress$ completado.');
      }
    });
    try {
             const url = await new Promise<string>((resolve, reject) => {
         let received = false;
         url$.subscribe({
           next: value => {
             // El servicio puede emitir inicialmente una cadena vacía.
             if (!received && typeof value === 'string' && value.trim().length > 2) {
               received = true;
               resolve(value);
             }
           },
           error: reject,
           complete: () => { if (!received) reject(new Error('La subida terminó sin URL')); }
         });
       });
      // URL definitiva generada por el servicio
      //console.log('======================================');
      //console.log('[Fotografía] URL FINAL MINIO:', url);
      //console.log('======================================');
      // La URL remota se conserva en images.
      // La imagen local se utiliza únicamente para visualizar.
      this.previewsByUrl[url] = this.asImageSrc(base64);
      this.photoEntries.push({ img: url, date: this.now(), status: 'c', note: '', pending: true });
      this.refreshImages();
      console.log('[Fotografía] URLs almacenadas:', this.images);
      //console.log('[Fotografía] Subida completada correctamente.');
    } finally {
      progressSub.unsubscribe();
    }
  } catch (err) {
    console.error('[Fotografía] Error subiendo:', err);
    this.errorMessage =
      'No fue posible subir la fotografía. Inténtalo nuevamente.';
  } finally {
    this.uploading = false;
    console.log('[Fotografía] Proceso upload() finalizado.');
  }
}


   /*removeImage(index: number): void {*/
    /*if (this.uploading) return;*/
    /*const url = this.images[index];*/
    /*if (url) { delete this.annotationsByUrl[url]; delete this.previewsByUrl[url]; delete this.brokenImages[url]; }*/
    /*this.setImages(this.images.filter((_, i) => i !== index));*/
    /*console.log('[Fotografía] Eliminada de la lista local:', url);*/
  /*}*/

  private setImages(images: string[]): void {
    this.images = [...images];
    this.imagenes = [...images];
    this.imagesChange.emit([...images]);
  }

  // Solo para la cuadrícula: la URL original sigue siendo la fuente de datos.
  thumbnailUrl(url: string): string {
    if (!url || /^(data:|blob:)/i.test(url)) return url;
    const match = url.match(/^([^?#]+)([?#].*)?$/);
    if (!match) return url;
    const path = match[1];
    if (/_thumbnail\.jpg$/i.test(path)) return url;
    return path.replace(/\.[^/.]+$/, '_thumbnail.jpg') + (match[2] || '');
  }

  // El editor mantiene la imagen original en resolución completa.
  imageSrc(url: string): string { return this.previewsByUrl[url] || url; }

  // Se conserva data.ini sin tocarla. Solo se escribe el arreglo data.end.
  private get busy(): boolean { return this.saving || this.uploading || this.savingEdited; }

  private storedEnd(): any[] {
    return Array.isArray(this.task?.data?.end) ? this.task.data.end : [];
  }

  private persistEnd(end: any[], onSuccess: () => void): void {
    if (this.busy) return;
    this.saving = true;
    this.errorMessage = '';
    this.tService.patchDataAttribute('mnt_t', this.task.id, 'end', end).subscribe({
      next: () => {
        this.task.data.end = end;
        this.saving = false;
        onSuccess();
      },
      error: err => {
        console.error('[Fotografías] Error actualizando end:', err);
        this.errorMessage = 'No se pudieron guardar las fotografías.';
        this.saving = false;
      }
    });
  }

  // Un único botón guarda TODAS las fotografías nuevas con una nota global.
  patch(): void {
    if (this.busy) return;
    const pending = this.photoEntries.filter(e => e.pending && e.status === 'c');
    if (!pending.length) {
      this.errorMessage = 'No hay fotografías nuevas para guardar.';
      return;
    }
    const end = [...this.storedEnd()];
    // Si una imagen guardada se editó, sustituir la URL dentro de su grupo.
    for (const photo of pending) {
      if (!photo.replacesUrl) continue;
      const group = end.find((x: any) => Array.isArray(x?.imgs) && x.imgs.includes(photo.replacesUrl));
      if (!group) {
        this.errorMessage = 'No se encontró la imagen original para reemplazar.';
        return;
      }
    }
    const edited = pending.filter(e => !!e.replacesUrl);
    for (const photo of edited) {
      const groupIndex = end.findIndex((x: any) => Array.isArray(x?.imgs) && x.imgs.includes(photo.replacesUrl));
      const group = { ...end[groupIndex], imgs: [...end[groupIndex].imgs] };
      group.imgs[group.imgs.indexOf(photo.replacesUrl)] = photo.img;
      end[groupIndex] = group;
    }
    const newUrls = pending.filter(e => !e.replacesUrl).map(e => e.img);
    if (newUrls.length) {
      const itr = {
        date: this.dateService.getDate(),
        imgs: newUrls,
        status: 'c',
        note: this.observations || ''
      };
      end.push(itr);
    }
    this.persistEnd(end, () => {
      this.observations = '';
      this.showObservations = false;
      this.loadTaskById();
    });
  }

  async removeImage(url: string): Promise<void> {
    if (this.busy) return;
    const photo = this.photoEntries.find(e => e.img === url && e.status === 'c');
    if (!photo) return;
    const alert = await this.alertController.create({
      header: 'Eliminar fotografía',
      message: 'La fotografía dejará de mostrarse.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.markDeleted(photo) }
      ]
    });
    await alert.present();
  }

  private markDeleted(photo: PhotoEntry): void {
    if (this.busy) return;
    if (photo.pending && !photo.replacesUrl) {
      // No se ha registrado en PostgreSQL: quitarla solo de la selección.
      this.photoEntries = this.photoEntries.filter(e => e !== photo);
      this.refreshImages();
      return;
    }
    const original = photo.replacesUrl || photo.img;
    const end = [...this.storedEnd()];
    const index = end.findIndex((x: any) => Array.isArray(x?.imgs) && x.imgs.includes(original));
    if (index < 0) {
      this.errorMessage = 'No se encontró la fotografía en data.end.';
      return;
    }
    const group = { ...end[index], imgs: [...end[index].imgs] };
    // Un grupo tiene un solo status. Si quedan otras imágenes activas,
    // mantenerlas y registrar la eliminada en otro grupo con status deleted.
    group.imgs = group.imgs.filter((url: string) => url !== original);
    if (group.imgs.length) {
      end[index] = group;
      end.push({ date: group.date, imgs: [original], status: 'deleted', note: group.note });
    } else {
      end[index] = { ...end[index], status: 'deleted' };
    }
    this.persistEnd(end, () => this.loadTaskById());
  }

  showNote(photo: PhotoEntry): void {
    this.notePhoto = photo;
    this.noteModalOpen = true;
  }

  closeNote(): void { this.noteModalOpen = false; this.notePhoto = null; }

  openEditor(url: string): void { this.openViewer(url, true); }

  imageFailed(url: string): void {
    this.brokenImages[url] = true;
    console.warn('[Fotografía] No se pudo visualizar la URL remota. Revisar permisos públicos de lectura de MinIO, URL y CORS:', url);
  }

  private asImageSrc(value: string): string {
    // Capacitor/PhotoService pueden devolver data URL o base64 sin prefijo.
    if (/^(data:image\/|blob:|https?:\/\/|capacitor:|file:)/i.test(value)) return value;
    return `data:image/jpeg;base64,${value.replace(/\s/g, '')}`;
  }

  openViewer(url: string, edit = false): void {
    this.selectedPhoto = this.photoEntries.find(e => e.img === url) || null;
    this.editorMode = edit;
    this.selectedUrl = url;
    this.modalPreviewSrc = this.imageSrc(url);
    console.log('[Editor] Abriendo vista previa local:', { url, local: !!this.previewsByUrl[url] });
    this.annotations = [...(this.annotationsByUrl[url] || [])];
    this.activeTool = 'point';
    this.viewerOpen = true;
  }

  closeViewer(): void {
    if (this.dragStart && this.draftEnd) this.finishStroke(this.draftEnd);
    this.viewerOpen = false;
    this.editorMode = false;
    this.selectedPhoto = null;
    this.selectedUrl = null;
    this.modalPreviewSrc = null;
    this.dragStart = null;
    this.draftEnd = null;
  }

  selectTool(tool: 'point' | 'circle' | 'arrow'): void {
    this.activeTool = tool;
    console.log('[Anotación] Herramienta seleccionada:', tool);
  }

  private getPosition(event: PointerEvent, element: HTMLElement): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    };
  }

  // El elemento HTML recibe los eventos; SVG queda reservado exclusivamente al dibujo.
  // Esto evita que los elementos SVG intercepten los gestos en Ionic/WebView.
  pointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const target = event.currentTarget as HTMLElement;
    event.preventDefault();
    this.dragStart = this.getPosition(event, target);
    this.draftEnd = { ...this.dragStart };
    try { target.setPointerCapture(event.pointerId); } catch (_) {}
    console.log('[Editor] Inicio de trazo:', this.activeTool, this.dragStart);
  }

  pointerMove(event: PointerEvent): void {
    if (!this.dragStart) return;
    event.preventDefault();
    this.draftEnd = this.getPosition(event, event.currentTarget as HTMLElement);
  }

  // Finalizar antes de limpiar el borrador: el trazo pasa a annotations,
  // que es la colección permanente usada tanto por SVG como por Canvas/S3.
  private finishStroke(end: { x: number; y: number }): void {
    if (!this.dragStart || this.selectedUrl === null) return;
    const start = this.dragStart;
    const annotation: Annotation = this.activeTool === 'point'
      ? { type: 'point', x1: end.x, y1: end.y }
      : { type: this.activeTool, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
    this.annotations = [...this.annotations, annotation];
    this.annotationsByUrl[this.selectedUrl] = [...this.annotations];
    this.dragStart = null;
    this.draftEnd = null;
    console.log('[Editor] Forma fijada (permanente):', annotation, 'Total:', this.annotations.length);
  }

  pointerUp(event: PointerEvent): void {
    if (!this.dragStart) return;
    event.preventDefault();
    this.finishStroke(this.getPosition(event, event.currentTarget as HTMLElement));
  }

  // Respaldo para WebViews que entregan pointerup fuera del elemento.
  @HostListener('document:pointerup', ['$event'])
  onDocumentPointerUp(event: PointerEvent): void {
    if (!this.viewerOpen || !this.dragStart) return;
    const surface = document.querySelector('.photo-editor-modal .drawing-surface') as HTMLElement | null;
    if (surface) this.finishStroke(this.getPosition(event, surface));
  }

  // pointercancel es una cancelación real del sistema; conservar el último
  // trazo visible en vez de descartarlo silenciosamente.
  cancelPointer(): void {
    if (this.dragStart && this.draftEnd) this.finishStroke(this.draftEnd);
  }

  get draftAnnotation(): Annotation | null {
    if (!this.dragStart || !this.draftEnd) return null;
    return this.activeTool === 'point'
      ? { type: 'point', x1: this.draftEnd.x, y1: this.draftEnd.y }
      : { type: this.activeTool, x1: this.dragStart.x, y1: this.dragStart.y,
          x2: this.draftEnd.x, y2: this.draftEnd.y };
  }

  undoAnnotation(): void {
    if (this.selectedUrl === null || !this.annotations.length) return;
    const removed = this.annotations[this.annotations.length - 1];
    this.annotations = this.annotations.slice(0, -1);
    this.annotationsByUrl[this.selectedUrl] = [...this.annotations];
    console.log('[Anotación] Deshacer:', removed);
  }

  async saveEditedImage(): Promise<void> {
    if (this.selectedUrl === null || !this.annotations.length || this.savingEdited || this.uploading) return;
    const originalUrl = this.selectedUrl;
    this.savingEdited = true;
    this.errorMessage = '';
    try {
      // Siempre usa la misma fuente local que funciona en la miniatura.
      const source = this.imageSrc(originalUrl);
      const photo = new Image();
      await new Promise<void>((resolve, reject) => {
        photo.onload = () => resolve();
        photo.onerror = () => reject(new Error('No se pudo abrir la fotografía para editar.'));
        photo.src = source;
      });
      const canvas = document.createElement('canvas');
      canvas.width = photo.naturalWidth;
      canvas.height = photo.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D no disponible');
      ctx.drawImage(photo, 0, 0);
      const sx = canvas.width / 100;
      const sy = canvas.height / 100;
      const stroke = Math.max(3, Math.min(canvas.width, canvas.height) * 0.006);
      ctx.strokeStyle = '#ff3838';
      ctx.fillStyle = '#ff3838';
      ctx.lineWidth = stroke;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const a of this.annotations) {
        const x1 = a.x1 * sx, y1 = a.y1 * sy;
        const x2 = (a.x2 ?? a.x1) * sx, y2 = (a.y2 ?? a.y1) * sy;
        if (a.type === 'point') {
          ctx.beginPath(); ctx.arc(x1, y1, stroke * 2, 0, Math.PI * 2); ctx.fill();
        } else if (a.type === 'circle') {
          ctx.beginPath();
          ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.max(1, Math.abs(x2 - x1) / 2), Math.max(1, Math.abs(y2 - y1) / 2), 0, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const head = stroke * 6;
          ctx.beginPath(); ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      }
      const editedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      console.log('[Editor] Subiendo imagen editada como NUEVO objeto:', { originalUrl, annotations: this.annotations });
      this.uploadProgress = 0;
      const { progress$, url$ } = this.photoService.uploadBase64Image(editedDataUrl, this.bucket, 's3mnt');
      const sub = progress$.subscribe(p => {
        this.uploadProgress = p;
        console.log(`[Editor] Subida de imagen editada: ${p}%`);
      });
      try {
                 const newUrl = await new Promise<string>((resolve, reject) => {
           let gotUrl = false;
           url$.subscribe({
             next: url => {
               if (!gotUrl && typeof url === 'string' && url.trim().length > 2) {
                 gotUrl = true;
                 resolve(url);
               }
             },
             error: reject,
             complete: () => { if (!gotUrl) reject(new Error('Subida finalizada sin URL')); }
           });
         });
         // Sustituir URL solo después de subir correctamente a MinIO.
         const entry = this.photoEntries.find(e => e.img === originalUrl);
         if (!entry) throw new Error('La imagen original ya no está en la lista.');
         this.previewsByUrl[newUrl] = editedDataUrl;
         delete this.previewsByUrl[originalUrl];
         delete this.annotationsByUrl[originalUrl];
         this.annotationsByUrl[newUrl] = [];
         if (!entry.pending) entry.replacesUrl = originalUrl;
         entry.img = newUrl;
         entry.pending = true;
         entry.date = this.now();
         this.refreshImages();
console.log('[Editor] ÉXITO: imagen modificada almacenada en MinIO:', { bucket: this.bucket, endpoint: 's3mnt', url: newUrl, originalUrl, taskId: this.task?.id ?? null, annotations: this.annotations.map(a => ({...a})), totalAnotaciones: this.annotations.length });
        console.log('[Editor] URL de imagen EDITADA subida:', newUrl);
        console.log('[Editor] URL original reemplazada en la lista:', originalUrl);
        this.closeViewer();
      } finally { sub.unsubscribe(); }
    } catch (error) {
      console.error('[Editor] FALLO al almacenar imagen editada en MinIO:', { bucket: this.bucket, endpoint: 's3mnt', error });
      this.errorMessage = 'No se pudo guardar la imagen editada.';
    } finally { this.savingEdited = false; }
  }

  sendAnnotations(): void {
    // Construir un payload independiente de la vista; nunca perder las formas al cerrar.
    const image = this.selectedUrl;
    const annotations = this.annotations.map(a => ({ ...a }));
    const payload = {
      taskId: this.task?.id ?? null,
      image,
      bucket: this.bucket,
      endpoint: 's3mnt',
      annotations,
      totalAnnotations: annotations.length,
      createdAt: new Date().toISOString()
    };
    console.log('[Anotaciones] Enviar al backend (payload):', payload);
    if (image === null) console.warn('[Anotaciones] No hay imagen seleccionada.');
    if (!annotations.length) console.warn('[Anotaciones] No hay anotaciones guardadas para esta imagen.');
    // El modal permanece abierto para permitir guardar también el JPEG editado.
  }

  onSearch(_value: any): void {}


/*// Compatibilidad: no existe guardado global. Cada foto tiene su propio botón.*/
/*patch(): void {*/
  /*this.errorMessage = 'Utiliza el botón Guardar de la fotografía correspondiente.';*/
/*}*/

  patchModified(): void { void this.saveEditedImage(); }


}
