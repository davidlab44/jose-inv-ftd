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
  selector: 'page-patch',
  templateUrl: 'patch.html',
  styleUrls: ['./patch.scss'],
})
export class AssetSupplyPatchPage {

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
  replenishment:any;
  assetSupplyProduct:any;

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
  ) {
    const item = this.router.getCurrentNavigation()?.extras.state?.item;
    console.log("Item recibido:", item);
    this.assetSupplyProduct = this.buildDefaultAssetSpupplyProduct(item);
  }
 
  ngOnInit() {
    this.loadCategories();
    this.loadUms();
    this.form = this.fb.group({
      id: [this.assetSupplyProduct.id],
      categ: [this.assetSupplyProduct.data.categ[0]],
      name: [this.assetSupplyProduct.data.name],
      barcode: [this.assetSupplyProduct.data.barcode],
      qty: [this.assetSupplyProduct.data.qty],
      um: [this.assetSupplyProduct.data.um],
    });
    console.log("Formulario inicializado:", this.form.value);
  }

  patch() {
    const payload = this.form.value;
    const id = payload.id;
    if (!id) {
      console.error("No ID found in form");
      return;
    }
    const justData = { ...payload };
    delete justData.id;      
    delete justData.ext_id;
    delete justData.created_at;     
    delete justData.updated_at;     
    justData.categ=[justData.categ];
    this.productService.patch(id, justData).subscribe({
      next: (r) => {
        console.log("PATCH OK:", r);
        this.utilService.presentToast("cant: "+r[0].data.qty+" "+r[0].data.name)
      },
      error: (e) => console.error("PATCH ERROR:", e),
    });
  }

  /*patch() {*/
    /*const payload = this.form.value;*/
    /*const id = payload.id;*/
    /*const justData = { ...payload };*/
    /*delete justData.id;*/
    /*delete justData.ext_id;*/
    /*delete justData.created_at;*/
    /*delete justData.updated_at;*/
    /*this.productService.patch(id, justData).subscribe({*/
      /*next: (r) => console.log("PATCH OK:", r),*/
      /*error: (e) => console.error("PATCH ERROR:", e),*/
    /*});*/
  /*}*/

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){
     
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

  private buildDefaultAssetSpupplyProduct(item: any) {
    const template = {
      id: null,
      ext_id: null,
      created_at: null,
      updated_at: null,
      data: {
       categ:[],
        name: "",
        barcode: 0,
        qty: 0,
        um: 0,
      }
    };
    return {
      ...template,
      ...item,
      data: {
        ...template.data,
        ...(item?.data ?? {})
      }
    };
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


}




