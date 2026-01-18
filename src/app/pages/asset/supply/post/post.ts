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
  ) {}

  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {
    this.loadCategories();
    this.loadUms();
    this.form = this.fb.group({
      category: [0],
      name: [''],
      barcode: [0],
      qty: [0],
      um: [0],
      target: [0],
      reorder: [0],
      minimum: [0],
    });
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
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
    delete data.category;
    console.log('Product to post =>', data);
    this.productService.post(data).subscribe({
      next: (response) => {
        console.log("product post response", response);
        if(response && response.length>0){
          this.utilService.presentToast(response.toString())
        }
      }
    });
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












  optimizedImage: string | null = null;
    imageName: string = '';
    async takePicture(): Promise<void> {
      this.optimizedImage = await this.photoService.takePicture();
      if (this.optimizedImage) {
        console.log('Imagen optimizada:', this.optimizedImage);
      } else {
        console.error('No se pudo tomar la foto');
      }
    }
    selectedImage: string | null = null;
    async pickImage(): Promise<void> {
      this.visibilidadBotonGallery = false;
      this.selectedImage = await this.imageService.pickImage(); 
      if (this.selectedImage) {
        console.log('Imagen seleccionada y comprimida:', this.selectedImage);
        this.optimizedImage=this.selectedImage; //this.showAttachment=true; //this.showPhoto=false;
      } else {
        console.error('No se seleccionó una imagen válida.');//this.showAttachment=false;
      }
    }
















}




