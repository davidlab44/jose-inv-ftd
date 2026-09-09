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
import { AtsService } from '../../../../services/ats/ats.service';
import { SrcService } from '../../../../services/ats/src.service';

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
    private photoService: PhotoService,
    private atsService: AtsService,
    private srcService: SrcService,
  ) {}

  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {
    this.loadCategories();
    this.loadUms();
    this.form = this.fb.group({
      name: [''],
      um: [0],
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
    data.img = this.uploadedUrl; 
    data.bom= this.bomList;
    //delete data.category;
    console.log('Product to post =>', data);
    this.srcService.post(data).subscribe({
      next: (response) => {
        console.log("ats post response", response);
        if(response && response.length>0){
          //this.utilservice.presenttoast(response.tostring())
          //this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceurl: true });    
        }
      }
    });
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){}

  productListCaos:any[]=[];
  ionViewWillEnter() {
    this.productService.getCachedOrServer().subscribe({
      next: (data) => {
        console.log('[SEARCH][2.1] productListx recibido:', data);
        this.productListCaos = data || [];
        this.filteredProductList = [];
        console.log('[SEARCH][3] productListCaos asignado -> cantidad:', this.productListCaos.length);
      },
      error: (err) => {
        console.error('[SEARCH][ERROR] error cargando productListCaos:', err);
      }
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
    console.log('[SEARCH][6.2] lista recibida -> cantidad:', productList?.length ?? 0);
    const term = (hash || '').trim().toLowerCase();
    if (!term) {
      return [];
    }
    const matches = (productList || []).filter((product, index) => {
      const name = product?.data.name;
      console.log('elemento lista',productList)
      console.log('elemento product',product)
      console.log('elemento name',name)
      const validName = typeof name === 'string';
      const match = validName && name.toLowerCase().includes(term);
      if (match) {
        console.log(`[SEARCH][7] MATCH index=${index} name=`, name, 'producto=', product);
      }
      return match;
    });

    console.log('[SEARCH][8] coincidencias totales antes de limitar:', matches.length);

    const visibleResults = matches.slice(0, 20);

    return visibleResults;
  }

  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;
    this.searchSubject.next(value);
    this.filteredProductList = this.searchProducts(value, this.productListCaos);
  }

  bomList:any[]=[];
  selectProduct(p: any) {
    console.log('p seleccionado',p)
    p.data.qty=1;
    p.data.categName=this.categoryService.getUmNameById(p.data.categ[0],this.categs);
    p.data.umName=this.umService.getUmNameById(p.data.um,this.ums);
    this.bomList.push(p)
    console.log('bomlist',this.bomList)
    this.hash = p?.name ?? '';
    this.filteredProductList = [];
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

  categs: any[] = [];    
  loadCategories() { 
      this.categoryService.getAllCategories().subscribe({ 
        next: (res) => {       
          this.categs = res;          
          this.categoryService.saveCategoriesToLocal(res); // Guarda en localStorage 
        }, 
        error: (err) => {      
          console.error('❌ Error al cargar categorías:', err); 
          //this.categs = this.categoryService.getCategoriesFromLocal(); 
        } 
      }); 
   }   
       
   ums: any[] = []; 
   loadUms() {                
     this.umService.getAllUms().subscribe({ 
        next: (res) => {       
          console.log('Ums unidades de medida :', res);    
          this.ums = res; 
          this.umService.saveUmsToLocal(res); 
        }, 
        error: (err) => {      
          console.error('Error al cargar categorías:', err); 
          this.ums = this.umService.getUmsFromLocal(); 
        } 
      }); 
   }     

  incrementQty(p: any, amount: number, event: Event) {
    event.stopPropagation();
    console.log('--------------------------------');
    console.log('[QTY] Producto:', p);
    console.log('[QTY] Incremento:', amount);
    console.log('[QTY] Qty anterior:', p.data.qty);
    const currentQty = Number(p?.data?.qty) || 0;
    p.data.qty = currentQty + amount;
    console.log('[QTY] Qty nueva:', p.data.qty);
  }

  clearQty(p: any, event: Event) {
    event.stopPropagation();
    console.log('--------------------------------');
    console.log('[QTY][CLEAR] Producto:', p);
    console.log('[QTY][CLEAR] Qty anterior:', p.data.qty);
    p.data.qty = 1;
    console.log('[QTY][CLEAR] Qty nueva:', p.data.qty);
  }

  removeById(p:any) {
    this.bomList = this.bomList.filter(item=>item.id !== p.id)
  }

  restartQty(p:any){
   p.data.qty=1;
   console.log('TEST ESBUILD 001');
  }


}
