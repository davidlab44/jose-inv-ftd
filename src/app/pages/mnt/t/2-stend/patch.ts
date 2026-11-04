import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CcoService } from '../../../../services/cc/cco.service';
import { TService } from '../../../../services/mnt/t.service';
import { MntService } from '../../../../services/mnt/mnt.service';
import { StgService } from '../../../../services/mnt/stg.service';
import { AtsService } from '../../../../services/ats/ats.service';
import { SrcService } from '../../../../services/ats/src.service';
import {  EventEmitter, Input, Output } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../../../../services/asset/photo.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'page-patch',
  templateUrl: 'patch.html',
  styleUrls: ['./patch.scss'],
})

export class PatchPage {
 private apiUrl=environment.pimApiHost;
  @Input() images: string[] = [];
  @Output() imagesChange = new EventEmitter<string[]>();
  @Input() maxImages = 10;
  @Input() bucket = 'mnt';

  uploading = false;
  uploadProgress = 0;
  errorMessage = '';

  constructor(

    private ccoService : CcoService,
    private router:Router,
    private tService: TService,
    private mntService: MntService,
    private stgService: StgService,
    private atsService: AtsService,
    private srcService: SrcService,
    private photoService: PhotoService,
    private actionSheetController: ActionSheetController
  ) {
   const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.item) {
      this.task = navigation.extras.state.item;
      this.uploadedUrl = this.task.data.imgin;
      this.task.uiDate=this.task.data.datein;
    } else {
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibido en patch:", this.task);
  }

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

      const { progress$, url$ } = this.photoService.uploadBase64Image(base64,'mntdev','s3mnt');

      //const { progress$, url$ } = this.photoService.uploadBase64Image(base64,this.bucket,this.apiUrl);
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

  task:any;

  ngOnInit() {
  }

  ionViewWillEnter() {
    //this.loadCco();
  }

  ionViewDidEnter() {}

  //uploadProgress = 0;
  uploadedUrl: string | null = null;
  //uploading = false;

  async takePhotoAndUpload() {
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedUrl = null;
    const base64Image = await this.photoService.takePicture();
    if (!base64Image) {
      this.uploading = false;
      console.error('No se pudo obtener la imagen');
      return;
    }
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');
    progress$.subscribe({
      next: (p) => this.uploadProgress = p,
      error: (err) => {
        console.error('Error subiendo imagen', err);
        this.uploading = false;
      }
    });
    url$.subscribe({
      next: (url) => {
        this.uploadedUrl = url;
        //this.launchOcr(url);
      },
      error: (err) => {
        console.error('Error obteniendo URL', err);
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  async pickImageAndUpload() {
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedUrl = null;
    const base64Image = await this.photoService.pickImage();
    if (!base64Image) {
      this.uploading = false;
      return;
    }
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');
    progress$.subscribe(p => this.uploadProgress = p);
    url$.subscribe({
      next: (url) => {
        this.uploadedUrl = url;
        //this.launchOcr(url);
      },
      error: (err) => {
        console.error('Error upload', err);
        this.uploading = false;
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  patch() {
    /*    this.withdrawnService.patch(this.movement.id, payload).subscribe({*/
      /*next: (response) => {*/
        /*console.log("Withdrawn patch response", response);*/
        /*//this.utilService.presentToast("registro actualizado exitosamente","success",1000);*/
        /*//this.router.navigate(['/app/tabs/mnt-t-getall'],   { replaceUrl: true });  */
      /*},*/
      /*error: (err) => {*/
        /*console.error("Withdrawn patch error", err);*/
      /*}*/
    /*});*/
  }

  onSearch(e:any){
  
  }




}




