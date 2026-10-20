import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../../../../services/asset/photo.service';

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
  observations = '';
  showObservations = false;
  selectedUrl: string | null = null;
  modalPreviewSrc: string | null = null;
  viewerOpen = false;
  savingEdited = false;
  // Vista previa local para URLs S3 no públicas (403/CORS).
  previewsByUrl: Record<string, string> = {};
  brokenImages: Record<string, boolean> = {};
  activeTool: 'point' | 'circle' | 'arrow' = 'point';
  annotations: Annotation[] = [];
  private annotationsByUrl: Record<string, Annotation[]> = {};
  private dragStart: { x: number; y: number } | null = null;
  draftEnd: { x: number; y: number } | null = null;

  constructor(private router: Router, private photoService: PhotoService,
              private actionSheetController: ActionSheetController) {
    const item = this.router.getCurrentNavigation()?.extras?.state?.item;
    if (item) {
      this.task = item;
      this.task.uiDate = this.task.data?.datein;
      // La lista @Input() sigue siendo la fuente principal de imágenes.
    }
  }

  get canAdd(): boolean { return !this.uploading && this.images.length < this.maxImages; }

  async addImage(): Promise<void> {
    if (!this.canAdd) return;
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
      const base64 = source === 'camera' ? await this.photoService.takePicture() : await this.photoService.pickImage();
      if (!base64) return;
      this.showObservations = true;
      console.log('[Fotografía] Imagen seleccionada. Iniciando subida...');
      const { progress$, url$ } = this.photoService.uploadBase64Image(base64, this.bucket, 's3mnt');
      const progressSub = progress$.subscribe({
        next: (p: number) => {
          this.uploadProgress = p;
          console.log(`[Fotografía] Progreso: ${p}%`);
        },
        error: err => console.error('[Fotografía] Error de progreso:', err)
      });
      try {
        const url = await new Promise<string>((resolve, reject) => {
          let received = false;
          url$.subscribe({
            next: value => { if (!received) { received = true; resolve(value); } },
            error: reject,
            complete: () => { if (!received) reject(new Error('La subida terminó sin URL')); }
          });
        });
        // La URL remota se conserva en images; la imagen local se usa solo para visualizar.
        this.previewsByUrl[url] = this.asImageSrc(base64);
        this.setImages([...this.images, url]);
        console.log('[Fotografía] URL después de subida:', url);
        console.log('[Fotografía] Subida completada. Vista previa local disponible.');
      } finally { progressSub.unsubscribe(); }
    } catch (err) {
      console.error('[Fotografía] Error subiendo:', err);
      this.errorMessage = 'No fue posible subir la fotografía. Inténtalo nuevamente.';
    } finally { this.uploading = false; }
  }

  sendObservations(): void {
    const text = this.observations.trim();
    console.log('[Observaciones] Enviar:', { text, images: [...this.images], taskId: this.task?.id ?? null });
    this.observations = '';
    this.showObservations = false;
  }

  removeImage(index: number): void {
    if (this.uploading) return;
    const url = this.images[index];
    if (url) { delete this.annotationsByUrl[url]; delete this.previewsByUrl[url]; delete this.brokenImages[url]; }
    this.setImages(this.images.filter((_, i) => i !== index));
    console.log('[Fotografía] Eliminada de la lista local:', url);
  }

  private setImages(images: string[]): void {
    this.images = images;
    this.imagesChange.emit(images);
  }

  imageSrc(url: string): string { return this.previewsByUrl[url] || url; }

  imageFailed(url: string): void {
    this.brokenImages[url] = true;
    console.warn('[Fotografía] No se pudo visualizar la URL remota. Revisar permisos públicos de lectura de MinIO, URL y CORS:', url);
  }

  private asImageSrc(value: string): string {
    // Capacitor/PhotoService pueden devolver data URL o base64 sin prefijo.
    if (/^(data:image\/|blob:|https?:\/\/|capacitor:|file:)/i.test(value)) return value;
    return `data:image/jpeg;base64,${value.replace(/\s/g, '')}`;
  }

  openViewer(url: string): void {
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
    if (this.dragStart) return;

    const target = event.currentTarget as HTMLElement;
    event.preventDefault();
    const position = this.getPosition(event, target);

    // Un punto se fija con un solo toque/clic; no necesita arrastrarse.
    if (this.activeTool === 'point') {
      if (!this.selectedUrl) return;
      const annotation: Annotation = { type: 'point', x1: position.x, y1: position.y };
      this.annotations = [...this.annotations, annotation];
      this.annotationsByUrl[this.selectedUrl] = [...this.annotations];
      console.log('[Editor] Punto fijado en la imagen:', annotation, 'Total:', this.annotations.length);
      return;
    }

    // Círculo y flecha se dibujan arrastrando y quedan fijados al soltar.
    this.dragStart = position;
    this.draftEnd = { ...position };
    try { target.setPointerCapture(event.pointerId); } catch (_) {}
    console.log('[Editor] Inicio de trazo:', this.activeTool, this.dragStart);
  }

  pointerMove(event: PointerEvent): void {
    if (!this.dragStart || (event.buttons === 0 && event.pointerType === 'mouse')) return;
    event.preventDefault();
    this.draftEnd = this.getPosition(event, event.currentTarget as HTMLElement);
  }

  // Finalizar antes de limpiar el borrador: el trazo pasa a annotations,
  // que es la colección permanente usada tanto por SVG como por Canvas/S3.
  private finishStroke(end: { x: number; y: number }): void {
    if (!this.dragStart || !this.selectedUrl) return;
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
    if (!this.selectedUrl || !this.annotations.length) return;
    const removed = this.annotations[this.annotations.length - 1];
    this.annotations = this.annotations.slice(0, -1);
    this.annotationsByUrl[this.selectedUrl] = [...this.annotations];
    console.log('[Anotación] Deshacer:', removed);
  }

  async saveEditedImage(): Promise<void> {
    if (!this.selectedUrl || !this.annotations.length || this.savingEdited || this.uploading) return;
    if (this.images.length >= this.maxImages) {
      this.errorMessage = 'Se alcanzó el máximo de fotografías.';
      console.warn('[Editor]', this.errorMessage);
      return;
    }
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
          ctx.ellipse((x1 + x2) / 2, (y1 + y2) / 2, Math.max(stroke * 2, Math.abs(x2 - x1) / 2), Math.max(stroke * 2, Math.abs(y2 - y1) / 2), 0, 0, Math.PI * 2);
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
            next: url => { if (!gotUrl) { gotUrl = true; resolve(url); } },
            error: reject,
            complete: () => { if (!gotUrl) reject(new Error('Subida finalizada sin URL')); }
          });
        });
        this.previewsByUrl[newUrl] = editedDataUrl;
        this.setImages([...this.images, newUrl]);
        console.log('[Editor] ÉXITO: imagen modificada almacenada en MinIO:', { bucket: this.bucket, endpoint: 's3mnt', url: newUrl, totalAnotaciones: this.annotations.length });
        console.log('[Editor] URL de imagen EDITADA subida:', newUrl);
        console.log('[Editor] URL de imagen ORIGINAL (conservada):', originalUrl);
        this.closeViewer();
      } finally { sub.unsubscribe(); }
    } catch (error) {
      console.error('[Editor] FALLO al almacenar imagen editada en MinIO:', { bucket: this.bucket, endpoint: 's3mnt', error });
      this.errorMessage = 'No se pudo guardar la imagen editada.';
    } finally { this.savingEdited = false; }
  }

  sendAnnotations(): void {
    console.log('[Anotaciones] Enviar:', { image: this.selectedUrl, annotations: this.annotations });
    this.closeViewer();
  }

  onSearch(_value: any): void {}
  patch(): void {}
}
