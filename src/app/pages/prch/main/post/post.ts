import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { OpportunityService } from '../../../../services/opportunity.service';
import { PosOrderService } from '../../../../services/pos-order.service';
import { TableService } from '../../../../services/table.service';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../../../interfaces/session';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { CategoryService } from '../../../../services/category.service';
import { UmService } from '../../../../services/um.service';
import { Product } from '../../../../interfaces/product';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DateService } from '../../../../services/local/date.service';
import { RexService } from '../../../../services/rex.service';
import { ProdrexService } from '../../../../services/prodrex.service';
import { UserService } from '../../../../services/user.service';
import { ReplenishmentService } from '../../../../services/replenishment/replenishment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from '../../../../services/asset/photo.service';


@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

  ios: boolean;
  hasOwner:boolean=false;
  segment = 'all';
  showSearchbar: boolean;
  opportunities = [];
  storedObject: any;
  posOrders: any[] = [];
  posOrderLineList: any[] = [];
  pendingCommands: any[] = [];
  deliveredList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any
  mesas: any[] = [];
  activeSession: Session | null = null;
  sessionId: number | null = null;
  searchSubject = new Subject<string>();
  todayDate:any;
  form!: FormGroup;
  replenishmentList: any[] = [];

   /*columns = [*/
      /*{ header: 'Fecha V', field: 'fecha_v' },*/
      /*{ header: 'Cont vacío', field: 'cont_vacio' },*/
      /*{ header: 'Rem vacío', field: 'rem_vacio' },*/
      /*{ header: 'Fe ing M', field: 'fe_ing_m' },*/
      /*{ header: 'Rem M LL', field: 'rem_m_ll' },*/
      /*{ header: 'Sur', field: 'sur' },*/
      /*{ header: 'Nort', field: 'nort' },*/
      /*{ header: 'Fecha', field: 'fecha' },*/
      /*{ header: 'Ticket', field: 'ticket' },*/
      /*{ header: 'PSI', field: 'psi' },*/
      /*{ header: 'OPC', field: 'opc' },*/
      /*{ header: 'IMPO', field: 'impo' },*/
      /*{ header: 'P Total', field: 'p_total' },*/
      /*{ header: 'Rotogate', field: 'rotogate' },*/
      /*{ header: 'P Vacío B', field: 'p_vacio_b' },*/
      /*{ header: 'Peso lleno B', field: 'peso_lleno_b' },*/
      /*{ header: 'P Neto', field: 'p_neto' },*/
      /*{ header: 'Dif', field: 'dif' },*/
      /*{ header: 'Precio P', field: 'precio_p' },*/
      /*{ header: 'Fecha F', field: 'fecha_f' },*/
      /*{ header: 'Factura', field: 'factura' },*/
      /*{ header: 'Valor Fact', field: 'valor_fact' },*/
      /*{ header: 'Sello1', field: 'sello1' },*/
      /*{ header: 'Sello2', field: 'sello2' },*/
      /*{ header: 'Sello3', field: 'sello3' },*/
    /*];*/
  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;

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
    private utilService:UtilService,
    private productService:ProductService,
    private categoryService:CategoryService,
    private umService:UmService,
    private dateService: DateService,
    private rexService: RexService,
    private prodrexService: ProdrexService,
    private userService: UserService,
    private fb: FormBuilder ,
    private replenishmentService : ReplenishmentService,
    private photoService: PhotoService
  ) {}

  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {
    this.loadCategories();
    this.loadUms();
    this.form = this.fb.group({
      com_name: [''],
      offc_name: [''],
      nit: [''],
      nit_n: [0],
      addr: [''],
      cel: [''],
      email: [''],
      cntct: [''],
    });
    const ahora = new Date();
    this.displayLast();
  }
 
  lastAsset:any;
  displayLast() {
    this.productService.getAll().subscribe({
      next: (response) => {
        this.lastAsset = response.reduce((max, item) =>
          item.id > max.id ? item : max
        );
      }
    });
  }

  guardar() {
    const data: any = this.form.value;
    data.categ = [data.category];
    data.img = this.uploadedUrl; 
    delete data.category;
    console.log('Product to post =>', data);
/*    this.productService.post(data).subscribe({*/
      /*next: (response) => {*/
        /*console.log("product post response", response);*/
        /*if(response && response.length>0){*/
          /*this.utilService.presentToast(response.toString())*/
          /*this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceUrl: true });    */
        /*}*/
      /*}*/
    /*});*/
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){
     
  }

  productListCaos:any[]=[];
  ionViewWillEnter() {
    this.productService.getCachedOrServer().subscribe(data => {
      this.productListCaos = data;
    });
  }

  prodrexList:any[]=[];
  ionViewDidEnter() {
    this.prodrexService.getAll().subscribe({
      next: response=>{
        this.prodrexList=response;
        console.log("getProdRexList",response)
      }
    })
  }

  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
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

    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'prch');

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
      },
      complete: () => this.uploading = false
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

    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'prch');

    progress$.subscribe(p => this.uploadProgress = p);
    url$.subscribe(url => {
      this.uploadedUrl = url;
      this.uploading = false;
    });
  }




/*this.s3Service.uploadToCertBucket(*/
  /*pdfBase64,*/
  /*'TCSU-500002-1',*/
  /*2026,*/
  /*'parcial'*/
/*);*/





}




