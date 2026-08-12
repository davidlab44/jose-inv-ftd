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
//import { BrowserMultiFormatReader } from '@zxing/browser';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat,DecodeHintType } from '@zxing/library';
import { RexService } from '../../services/rex.service';
import { ProdrexService } from '../../services/prodrex.service';
import { Product, defaultProduct } from '../../interfaces/product';
import { UserService} from '../../services/user.service';
import { RgxService} from '../../services/local/frm/rgx.service';

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
  itemRouted:any;

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
    private userService:UserService,
    private rgxService:RgxService
  ) {
    (window as any).productService=this.productService
  }

  updateSchedule(){}
  hash:string='';
  table:any
  storedObject:any;

  /*async ngOnInit(){*/
  /*}*/
 
  async ngOnInit() {
    const hints = new Map();
    hints.set(
      DecodeHintType.POSSIBLE_FORMATS,
      [
        BarcodeFormat.CODE_128
      ]
    );
    this.codeReader = new BrowserMultiFormatReader(hints);
  }  

  async setSession() {
    this.storedObject = await this.userService.getStoredUserInfo();
    console.log("userInfo schedule",this.storedObject)
    if(!this.storedObject){
      this.router.navigateByUrl('/login');
      return;
    }
    else{
       console.log("navigate to plexa")
       if(this.storedObject && this.storedObject.data && this.storedObject.data.role==7){
         console.log("navigate to plexa1")
         this.router.navigate(['/app/tabs/replenishment-get-getall']);
        }
    }
  }

  refreshView() {
    this.setSession();
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
    this.productService.refreshFromServer().subscribe(data => {
      this.productListOriginal = data;
    });
    this.loadCategories();
    this.loadUms();

  const state = history.state;

  if (state?.item) {
    this.itemRouted = state.item;
    console.log('item routed', this.itemRouted);
    if (
      Number(this.itemRouted?.data?.barcode) &&
      Number(this.itemRouted.data.barcode) > 0
    ) {
      this.getProductById(Number(this.itemRouted.id));
    }
  }
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
      this.componentsEnabled = false;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: 'environment'
          }
        },
        audio: false
      });
      const video = this.videoElement.nativeElement;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();
      this.codeReader.decodeFromVideoElement(
        video,
        (result) => {

          if (!result) {
            return;
          }

          const code = result.getText()?.trim();

          if (!code) {
            return;
          }

          this.scannedValue = code;

          this.getProductByBarcode(
            Number(this.scannedValue)
          );

          this.componentsEnabled = true;

          this.stopScan();
        }
      );

    } catch (error) {

      this.componentsEnabled = true;

      console.error(
        '❌ Error al acceder a la cámara:',
        error
      );
    }
  }

  stopScan() {

    try {

      if (
        this.codeReader &&
        typeof (this.codeReader as any).reset === 'function'
      ) {
        (this.codeReader as any).reset();
      }

      const video =
        this.videoElement?.nativeElement;

      if (
        video &&
        video.srcObject instanceof MediaStream
      ) {

        video.srcObject
          .getTracks()
          .forEach(track => track.stop());

        video.srcObject = null;
      }

    } catch (e) {

      console.warn(
        '⚠️ Error al detener la cámara:',
        e
      );
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
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
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
    console.log('product to patch',this.prdct);
    this.prdct.data.qty= this.prdct.data.qty-this.extraQty;
    //console.log('4product to update qty',this.prdct);
     this.productService.updateProductQty(this.prdct.id,this.prdct).subscribe({
      next: (r)=>{
        console.log('patchProduct qty response',r) //parece que isInteger() esta alreves si algo revisalo 
        if(this.rgxService.isInteger(this.prdct.id)){this.utilService.presentToast('Producto no valido','danger');}
        if(this.rgxService.isInteger(this.extraQty)){this.utilService.presentToast('Cantidad no valida','danger');}
        if(this.rgxService.isInteger(this.prdct.id)){this.utilService.presentToast('Remisión no valida','danger');}
        this.prodrexService.addProdrexItem(this.prdct.id,this.extraQty,this.rexDocument[0].id).subscribe({
          next: (res) =>{
            console.log("res",res)
            this.prodrexService.getAll().subscribe({
              next: (r)=>{
                this.prdct=defaultProduct;
                this.scannedValue='';
              }
            })
          }
        })
      }
    });
  }

/*  updateProductQty(productId:number,data:any){*/
    /*this.productService.updateProductQty(productId, data).subscribe({*/
      /*next: (res) => {*/
        /*//console.log('Cantidad actualizada:', res);*/
      /*},*/
      /*error: (err) => {*/
        /*console.error('Error al actualizar cantidad:', err);*/
      /*}*/
    /*});*/
  /*}*/

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




