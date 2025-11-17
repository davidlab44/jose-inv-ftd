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
import { BarcodeService } from '../../services/barcode.service';
import { BrowserMultiFormatReader } from '@zxing/browser';


@Component({
  selector: 'page-scnbrcd',
  templateUrl: 'scnbrcd.html',
  styleUrls: ['./scnbrcd.scss'],
})
export class ScnbrcdPage {

  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

    scannedValue: string = '';
    private codeReader = new BrowserMultiFormatReader();
    private selectedDeviceId: string | null = null;


    async startScan() {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) {
          console.error('No se encontraron cámaras');
          return;
        }

        // Busca cámara trasera
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('trás') ||
          d.label.toLowerCase().includes('principal')
        );

        // Usa la trasera si existe, de lo contrario la primera
        this.selectedDeviceId = backCamera ? backCamera.deviceId : devices[0].deviceId;
        console.log('Usando cámara:', backCamera ? backCamera.label : devices[0].label || 'sin etiqueta');

        this.codeReader.decodeFromVideoDevice(
          this.selectedDeviceId,
          this.videoElement.nativeElement,
          (result, err) => {
            if (result) {
              this.scannedValue = result.getText();
              console.log('Código leído:', this.scannedValue);
              this.stopScan(); // detiene la cámara después de leer
            }
            if (err && !(err.name === 'NotFoundException')) {
              console.error(err);
            }
          }
        );
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
      }
    }

      /*    async startScan() {*/
      /*try {*/
        /*const devices = await BrowserMultiFormatReader.listVideoInputDevices();*/
        /*if (!devices.length) {*/
          /*console.error('No se encontraron cámaras');*/
          /*return;*/
        /*}*/

        /*this.selectedDeviceId = devices[0].deviceId;*/
        /*console.log('Usando cámara:', devices[0].label || 'sin etiqueta');*/

        /*this.codeReader.decodeFromVideoDevice(*/
          /*this.selectedDeviceId,*/
          /*this.videoElement.nativeElement,*/
          /*(result, err) => {*/
            /*if (result) {*/
              /*this.scannedValue = result.getText();*/
              /*console.log('Código leído:', this.scannedValue);*/
              /*this.stopScan(); // detiene la cámara después de leer*/
            /*}*/
            /*if (err && !(err.name === 'NotFoundException')) {*/
              /*console.error(err);*/
            /*}*/
          /*}*/
        /*);*/
      /*} catch (error) {*/
        /*console.error('Error al acceder a la cámara:', error);*/
      /*}*/
    /*}*/

    stopScan() {
      try {
        // Algunas versiones usan stopStreams(), otras reset()
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

















 // printSelectedBarcodes
  ios: boolean;
  segment = 'all';
  showSearchbar: boolean;
  opportunities = [];
  storedObject: any;
  posOrders: any[] = [];
  posOrderLineList: any[] = [];
  pendingCommands: any[] = [];
  deliveredList: any[] = [];
  productList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any
  mesas: any[] = [];
  activeSession: Session | null = null;
  sessionId: number | null = null;

  constructor(
    private barcodeService: BarcodeService,
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private opportunityService: OpportunityService,
    private posOrderService: PosOrderService,
    private tableService: TableService,
    private route: ActivatedRoute,
    private sessionService:SessionService,
    private utilService:UtilService
  ) {}


 printSelectedBarcodes() {
    // Datos hardcoded de prueba
    const selectedBarcodes = ['110', '111', '112', '113'];

    this.barcodeService.downloadPDF(selectedBarcodes);
  }






  hash:string='';
  table:any
  ngOnInit() {
    this.getActiveSession();
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      //this.table = params['table'];
      console.log('ID categoría recibida:', id);
      //console.log('table recibida:', this.table);
      if(Number(id)>0){
        this.getProductByCat(Number(id));
      }else{
        this.getProductByCat(2);
      }
    });
    console.log("ngOnInit")
  }


  updateSchedule(){
    this.filteredProductList = this.searchProducts(this.queryText, this.productList);
    //console.log("sin filtrar",this.productList);
    //console.log("filtered",this.filteredProductList);
    if(this.filteredProductList && this.filteredProductList.length && this.filteredProductList.length==0){
      this.filteredProductList=this.productList
    }
  }

  ionViewDidEnter() {}

  posCategId:number=0
  getProductByCat(categId:number) {
    this.posCategId=categId;
    //console.log("cat en metod init",this.posCategId)
    this.opportunityService.getProductsByCat(environment.i, environment.p,categId).subscribe({
      next: response => {
        console.log('products By Cat',response.result)
        this.productList = response.result;
        this.filteredProductList = response.result;
        //this.getPosOrderLineDeliveredList();
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

  session: any;
  getActiveSession() {
    this.sessionService.getActiveSession(environment.i, environment.p).subscribe({
      next: (session: Session | null) => {
        //console.log('getActiveSession', session);
        if (session) {
          this.activeSession = session;
          this.sessionId = session.id;
          //console.log('ID de la sesión:', this.sessionId);
          // Guardamos en localStorage
          localStorage.setItem('current_pos_session', JSON.stringify(session));
        } else {
          console.log('No hay sesión activa');
          //Borramos la clave si no hay sesión
          localStorage.removeItem('current_pos_session');
        }
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }


  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }

  addToOrder(product: any) {
    const availableQuantity = product.qty_available;

    // 🔑 1. Recuperar o crear el UID de la orden
    let currentUid = localStorage.getItem('current_order_uid');
    if (!currentUid) {
      currentUid = Date.now().toString();
      localStorage.setItem('current_order_uid', currentUid);
      console.log("Nuevo UID creado:", currentUid);
    }

    // 🔑 2. Recuperar carrito actual
    let order: any[] = JSON.parse(localStorage.getItem('order') || '[]');

    // 🔑 3. Buscar si el producto ya existe en la orden
    const existing = order.find(item => item.id === product.id);

    if (existing) {
      if (existing.cant + 1 <= availableQuantity) {
        existing.cant += 1;
      } else {
        this.utilService.presentToast(
          `No puedes agregar más de ${availableQuantity} unidades de ${product.display_name || product.name}`,
          'danger',
          800
        );
        return;
      }
    } else {
      if (availableQuantity >= 1) {
        order.push({
          id: product.id,
          name: product.display_name || product.name,
          price: product.list_price,
          cant: 1,
          //posCategId: product.categ_id ? product.categ_id[0] : null, // 👈 se almacena el id de la categoría POS
          posCategId: this.posCategId,
        });
        this.utilService.presentToast('Producto agregado ✅', 'success', 800);
      } else {
        this.utilService.presentToast(
          `Stock insuficiente para ${product.display_name || product.name}`,
          'danger',
          800
        );
        return;
      }
    }

    // 🔑 4. Guardar carrito actualizado en localStorage
    localStorage.setItem('order', JSON.stringify(order));
  }



  getMesas() {
    this.tableService.getTables(environment.i, environment.p).subscribe({
      next: response => {
        this.mesas = response.result;
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

}




