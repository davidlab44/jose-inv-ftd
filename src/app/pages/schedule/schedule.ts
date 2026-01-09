import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { debounceTime, Subject } from 'rxjs';
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
import { RexService } from '../../services/rex.service';
import { ProdrexService } from '../../services/prodrex.service';
import { Product, defaultProduct } from '../../interfaces/product';
import { UserService} from '../../services/user.service';

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
  styleUrls: ['./schedule.scss'],
})
export class SchedulePage{
  @ViewChild('video', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  private codeReader = new BrowserMultiFormatReader();
  private selectedDeviceId: string | null = null;
  ios: boolean;
  segment = 'all';
  showSearchbar: boolean;
  productList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  exitList: any[] = [];
  queryText:any
  todayDate:any
  barcodeRouted:any;

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
    private umService: UmService,     
    private prodrexService: ProdrexService,
    private rexService: RexService,
    private userService:UserService
  ) {
    (window as any).productService=this.productService
  }

  updateSchedule(){}

  hash:string='';
  table:any

  storedObject:any;
  async ngOnInit(){
    //this.refreshView();
  }
  
  async setSession() {
    this.storedObject = await this.userService.getStoredUserInfo();
    console.log("userInfo schedule",this.storedObject)
    if(!this.storedObject){
      this.router.navigateByUrl('/login');
      return;
    }
  }

  /*  storedObject:any*/
  /*p:any;*/
  /*async setSesion(){*/
    /*this.u=localStorage.getItem('u');*/
    /*this.p=localStorage.getItem('p');*/
    /*this.storedObject = await this.userService.login(u,p);*/
    /*console.log("userInfo",this.storedObject)*/
    /*console.log("p",this.p)*/
    /*console.log("userInfo",this.storedObject)*/
    /*if (!this.storedObject.im_hr) {*/
      /*this.router.navigateByUrl('/app/tabs/client');*/
    /*} else {*/
      /*try {*/
        /*await this.validateUserInfo(this.storedObject);*/
        /*await this.retrieveAllData();*/
        /*this.startTimer();*/
      /*} catch (error) {*/
        /*console.error('Error validating user info or retrieving data', error);*/
      /*}*/
    /*}*/
  /*}*/

  refreshView() {
    this.setSession();
    //const id_product_route= this.route.snapshot.paramMap.get('id');
    //const myUrl = window.location.href;
    //console.log('URL actual:', myUrl);
      /*    const urlsPermitidas = [*/
      /*'http://10.100.100.4:8505',*/
      /*'http://10.100.100.4:8505/',*/
      /*'adt.chrisantemogourmet.com',*/
      /*'https://adt.chrisantemogourmet.com'*/
    /*];*/
    /*if (urlsPermitidas.some(url => myUrl.includes(url))) {*/
      /*this.router.navigate(['/app/tabs/scnbrcd']);*/
    /*}*/
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
    this.productService.refreshFromServer().subscribe(data => {
      this.productListOriginal = data;
    });
    this.loadCategories();
    this.loadUms();
/*    this.barcodeRouted = this.router.getCurrentNavigation()?.extras.state?.item;*/
    
    /*console.log('routed',this.barcodeRouted)*/
    /*if(Number(this.barcodeRouted.data.barcode) && Number(this.barcodeRouted.data.barcode)>0 ){*/
      /*this.getProductById(Number(this.barcodeRouted.data.barcode))*/
    /*}else{*/
      /*//this.getProductById(87); */
    /*}*/


  const state = history.state;

  if (state?.item) {
    this.barcodeRouted = state.item;

    console.log('routed', this.barcodeRouted);

    if (
      Number(this.barcodeRouted?.data?.barcode) &&
      Number(this.barcodeRouted.data.barcode) > 0
    ) {
      this.getProductById(Number(this.barcodeRouted.data.barcode));
    }
  }
    //this.getProductById(87);
    this.loadProdrex();
    this.rexService.getLast().subscribe({
      next: (response) => {
        this.rexDocument=response;
        //console.log("response rex table",response)
        if(response[0].state=='delivered'){
          this.rexService.addRex().subscribe({
            next: (response)=>{
              console.log('rex posted',response);
              this.rexService.getLast().subscribe({
                next: (r)=>{
                  console.log('getLast',r);
                  this.rexDocument=response;
                }
              })
            }
          })
        }
      }
    })
    this.inputChanged.pipe(debounceTime(1000)).subscribe((val) => {
      console.log('🕐 Input después de 1s sin cambios:', val);
        const manualBarcode=Number(val);
        if(manualBarcode>0){
          this.getProductByBarcode(Number(val));
          this.componentsEnabled = true;
          this.stopScan();
        }else{
          this.utilService.presentToast('barcode ingresado no es un numero');
        }
    });
  }

  productListOriginal:any[]=[];
  ionViewWillEnter() {
    this.refreshView();
  }

  rexDocument:any;
  async ionViewDidEnter() {
  }

  componentsEnabled: boolean = true;
  scannedValue: string = '';
  async startScan() {
    this.refreshView();
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
      this.codeReader.decodeFromVideoDevice(
        backCamera.deviceId,
        this.videoElement.nativeElement,
        (result, err) => {
          if (result) {
            const code = result.getText()?.trim();
            if (code && code.length > 0) {
              this.scannedValue = code;
              this.getProductByBarcode(Number(this.scannedValue));
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
      //console.log('Escaneo detenido correctamente');
    } catch (e) {
      console.warn('Error al detener la cámara:', e);
    }
  }

  prdct:any
  getProductById(id: number) {
    console.log('product id',id)
    this.productService.getProductById(id).subscribe(data => {
      this.prdct = data[0];
      //this.extraQty=0;
    });
  }
  
  getProductByBarcode(barcode: number) {
    this.productService.getProductByBarcode(barcode).subscribe(data => {
      this.prdct = data[0];
      //this.extraQty=0;
    });
  }

  categories: any[] = [];
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (res) => {
        this.categories = res;
        this.categoryService.saveCategoriesToLocal(res);
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
        this.categories = this.categoryService.getCategoriesFromLocal();
      }
    });
  }

  prodrexList: any[] = [];
  loadProdrex() {
    this.rexService.getProdrexList(1).subscribe({
      next: (res) => {
        this.prodrexList = res;
        //this.categoryService.saveCategoriesToLocal(res); // Guarda en localStorage
        //console.log("res",res)
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
        //this.categories = this.categoryService.getCategoriesFromLocal();
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
    return cat ? cat.data?.nombre || 'Sin categoría' : 'Sin categoría';
  }

  getUmNameById(id: number | string): string {
    const idNum = Number(id);
    const um = this.ums.find(u => Number(u.id) === idNum);
    return um?.data?.name ? um.data.name : 'Sin UM';
  }

  extraQty = 0;
  clearQty() {
    this.extraQty = 0;
  }

  addQty(value: number) {
    console.log('2product',this.prdct)
    console.log('2value',value)
    //const availableQty = Number(this.prdct?.data?.qty) - value;
    const availableQty = Number(this.prdct?.data?.qty);
    //this.utilService.presentToast('requestedQty '+value+this.extraQty)
    if (Number.isNaN(availableQty)) {
      this.utilService.presentToast("availableQty is NaN", "danger", 500);
      return;
    }
    if((value+this.extraQty)>availableQty){
      this.utilService.presentToast("not such Qty available", "danger", 500);
      return;
    }
    if (availableQty >= 0) {
      this.extraQty = this.extraQty+value
    } else {
      this.utilService.presentToast("No tiene suficiente stock", "danger", 1000);
    }
  }

  confirmAction() {
    //console.log('3product to update qty',this.prdct);
    this.prdct.data.qty= this.prdct.data.qty-this.extraQty;
    //console.log('4product to update qty',this.prdct);
     this.productService.updateProductQty(this.prdct.id,this.prdct).subscribe({
      next: (r)=>{
        console.log('patchProduct qty response',r)
        this.prodrexService.addProdrexItem(this.prdct.id,this.extraQty,this.rexDocument[0].id).subscribe({
          next: (res) =>{
            console.log("res",res)
            this.prodrexService.getAll().subscribe({
              next: (r)=>{
                //console.log('prodService refresh response',r)
                //this.getProductById(87);
                this.prdct=defaultProduct;
                this.scannedValue='';
              }
            })
          }
        })
      }
    });
  }

  updateProductQty(productId:number,data:any){
    this.productService.updateProductQty(productId, data).subscribe({
      next: (res) => {
        //console.log('Cantidad actualizada:', res);
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
      }
    });
  }

  openReport(){
    this.router.navigate(['/app/tabs/prodrex']);
  }

  exitApp() {
    console.log('Saliendo de la app');
    window.location.href = 'https://www.google.com';
  }

  formatFechaLatam(dateInput: string | Date | number): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    const fechaTexto = new Intl.DateTimeFormat('es-ES', opciones).format(date);
    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    if (horas === 0) horas = 12; // 12 AM o 12 PM en lugar de 0
    const horasTexto = String(horas).padStart(2, '0');
    return `${fechaTexto} ${horasTexto}:${minutos}:${segundos} ${ampm}`;
  }

  private inputChanged: Subject<string> = new Subject();

  onInputChange() {
    this.inputChanged.next(this.scannedValue);
  }


}




