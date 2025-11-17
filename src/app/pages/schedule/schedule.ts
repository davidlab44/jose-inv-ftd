import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { OpportunityService } from '../../services/opportunity.service';
import { PosOrderService } from '../../services/pos-order.service';
import { TableService } from '../../services/table.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../interfaces/session';
import { SessionService } from '../../services/session.service';
import { UtilService } from '../../services/util.service';
import { ProductService } from '../../services/product.service';
import { BarcodeService } from '../../services/barcode.service';
import { CategoryService } from '../../services/category.service';
import { UmService } from '../../services/um.service';
import { BrowserMultiFormatReader } from '@zxing/browser';

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage {
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  private codeReader = new BrowserMultiFormatReader();
  private selectedDeviceId: string | null = null;
  ios: boolean;
  segment = 'all';
  showSearchbar: boolean;
  productList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any

  constructor(
    private barcodeService: BarcodeService,
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private opportunityService: OpportunityService,
    private route: ActivatedRoute,
    private sessionService:SessionService,
    private utilService:UtilService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private umService: UmService
  ) {}

  updateSchedule(){}

  hash:string='';
  table:any

  ngOnInit() {
    const myUrl = window.location.href;
    console.log('URL actual:', myUrl);
/*    const urlsPermitidas = [*/
      /*'http://10.100.100.4:8505',*/
      /*'http://10.100.100.4:8505/',*/
      /*'adt.chrisantemogourmet.com',*/
      /*'https://adt.chrisantemogourmet.com'*/
    /*];*/
    /*if (urlsPermitidas.some(url => myUrl.includes(url))) {*/
      /*this.router.navigate(['/app/tabs/scnbrcd']);*/
    /*}*/
  }


  async ionViewDidEnter() {
    await this.loadCategories();
    await this.loadUms();
    this.getProductById(173); 
  }

  scannedValue: string = '';
  componentsEnabled: boolean = true;
  async startScan() {
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (!devices.length) {
        console.error('No se encontraron cámaras');
        return;
      }
      const backCamera = devices.find(d =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('trás') ||
        d.label.toLowerCase().includes('principal')
      );
      if (!backCamera) {
        console.error('No se detectó cámara trasera');
        return;
      }
      //console.log('🎥 Usando cámara trasera:', backCamera.label);
      this.codeReader.decodeFromVideoDevice(
        backCamera.deviceId,
        this.videoElement.nativeElement,
        (result, err) => {
          if (result) {
            const code = result.getText()?.trim();
            if (code && code.length > 0) {
              this.scannedValue = code;
              this.getProductById(Number(this.scannedValue));
              this.componentsEnabled = true;
              this.stopScan();
            }
          }
          if (err && !(err.name === 'NotFoundException')) {
            console.error('⚠️ Error de lectura:', err);
          }
        }
      );
    } catch (error) {
      console.error('❌ Error al acceder a la cámara trasera:', error);
    }
  }

  stopScan() {
    try {
      if ((this.codeReader as any).stopStreams) {
        (this.codeReader as any).stopStreams();
      } else if ((this.codeReader as any).reset) {
        (this.codeReader as any).reset();
      }
      const video = this.videoElement?.nativeElement;
      if (video && video.srcObject instanceof MediaStream) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      console.log('Escaneo detenido correctamente');
    } catch (e) {
      console.warn('Error al detener la cámara:', e);
    }
  }

  product:any
  getProductById(id: number) {
    this.productService.getProductById(id).subscribe(data => {
      this.product = data[0];
    });
  }

  categories: any[] = [];
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.categoryService.saveCategoriesToLocal(res); // Guarda en localStorage
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
        this.categories = this.categoryService.getCategoriesFromLocal();
      }
    });
  }

  ums: any[] = [];

  loadUms() {
    this.umService.getAllUms().subscribe({
      next: (res) => {
        console.log('✅ Ums:', res);
        this.ums = res;
        this.umService.saveUmsToLocal(res);
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
        this.ums = this.umService.getUmsFromLocal();
      }
    });
  }

  getCategoryNameById(id: number): string {
    const cat = this.categories.find(c => c.id === id);
    return cat ? cat.datos?.nombre || 'Sin categoría' : 'Sin categoría';
  }

  getUmNameById(id: number | string): string {
    const idNum = Number(id);
    const um = this.ums.find(u => Number(u.id) === idNum);
    return um?.datos?.name ? um.datos.name : 'Sin UM';
  }

  extraQty = 0;
  clearQty() {
    this.extraQty = 0;
  }

  addQty(value: number) {
    const allowedCant = Number(this.product?.datos?.qty) - value;
    console.log("allowed", allowedCant);

    // ✅ Validar correctamente si el valor no es un número
    if (Number.isNaN(allowedCant)) {
      this.utilService.presentToast("allowedCant is NaN", "danger", 500);
      return; // salimos de la función
    }

    if (allowedCant >= 0) {
      this.extraQty += value;
    } else {
      this.utilService.presentToast("No tiene suficiente stock", "danger", 1000);
    }
  }

  confirmAction() {
    const newQty = this.product.datos.qty - this.extraQty;
    console.log("newQty",newQty)
    if (newQty >= 0) {
      this.product.datos.qty = newQty;
      this.updateProductQty(this.product.id, this.product);
    } else {
      this.utilService.presentToast("No tiene suficiente stockk", "default", 1000);
    }
  }

  updateProductQty(productId:number,datos:any){
    this.productService.updateProductQty(productId, datos).subscribe({
      next: (res) => {
        console.log('Cantidad actualizada:', res);
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
      }
    });
  }

  exitApp() {
    console.log('🛑 Saliendo de la app');
    window.location.href = 'https://www.google.com';
  }


}




