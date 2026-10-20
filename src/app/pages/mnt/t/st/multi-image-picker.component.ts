import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../../../../services/asset/photo.service';

@Component({
  selector: 'app-multi-image-picker',
  templateUrl: './multi-image-picker.component.html',
  styleUrls: ['./multi-image-picker.component.scss'],
})
export class MultiImagePickerComponent {
  @Input() images: string[] = [];
  @Output() imagesChange = new EventEmitter<string[]>();
  @Input() maxImages = 10;
  @Input() bucket = 'fotos';

  uploading = false;
  uploadProgress = 0;
  errorMessage = '';

  constructor(
    private photoService: PhotoService,
    private actionSheetController: ActionSheetController
  ) {}

  get canAdd(): boolean {
    return !this.uploading && this.images.length < this.maxImages;
  }

  async addImage(): Promise<void> {
    if (!this.canAdd) return;
    const sheet = await this.actionSheetController.create({
      header: 'Agregar fotografía',
      buttons: [
        { text: 'Tomar foto', icon: 'camera-outline', handler: () => { void this.upload('camera'); } },
        { text: 'Elegir de galería', icon: 'images-outline', handler: () => { void this.upload('gallery'); } },
        { text: 'Cancelar', icon: 'close', role: 'cancel' },
      ],
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

      const { progress$, url$ } = this.photoService.uploadBase64Image(base64, this.bucket);
      const progressSub = progress$.subscribe({
        next: p => this.uploadProgress = p,
        error: err => console.error('Error de progreso:', err),
      });
      try {
        // The upload service returns a URL observable; resolve its first URL.
        const url = await new Promise<string>((resolve, reject) => {
          url$.subscribe({
            next: value => resolve(value),
            error: reject,
            complete: () => reject(new Error('La subida terminó sin URL')),
          });
        });
        this.setImages([...this.images, url]);
      } finally {
        progressSub.unsubscribe();
      }
    } catch (err) {
      console.error('Error subiendo fotografía:', err);
      this.errorMessage = 'No fue posible subir la fotografía. Inténtalo nuevamente.';
    } finally {
      this.uploading = false;
    }
  }

  removeImage(index: number): void {
    if (this.uploading) return;
    this.setImages(this.images.filter((_, i) => i !== index));
  }

  private setImages(images: string[]): void {
    this.images = images;
    this.imagesChange.emit(images);
  }
}
