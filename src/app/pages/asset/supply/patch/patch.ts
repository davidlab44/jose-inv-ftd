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


       
       
    console.log('Bartolito');
    const item = history.state?.item ?? null;
    console.log('Item recibido:', item);
    this.assetSupplyProduct = this.buildDefaultAssetSpupplyProduct(item);
    /* const item = this.router.getCurrentNavigation()?.extras.state?.item;*/
    /*console.log("Item recibido:", item);*/
    /*this.assetSupplyProduct = this.buildDefaultAssetSpupplyProduct(item);*/
  }
 
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.initForm();
    if (this.assetSupplyProduct) {
      this.fillForm(this.assetSupplyProduct);
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      categ: [null],
      name: [''],
      barcode: [null],
      qty: [0],
      um: [null],
      target: [0],
      reorder: [0],
      minimum: [0],
    });
  }

  fillForm(product: any) {
    if (!product || !product.data || !this.form) {
      return;
    }
    const data = product.data;
    this.form.patchValue({
      id: product.id ?? null,
      categ: data.categ?.[0] ?? null,
      name: data.name ?? '',
      barcode: data.barcode ?? null,
      qty: data.qty ?? 0,
      um: data.um ?? null,
      target: data.target ?? 0,
      reorder: data.reorder ?? 0,
      minimum: data.minimum ?? 0,
    });
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
        this.resetForm();
       this.utilService.presentToast('resetForm')
       this.router.navigate(['/app/tabs/asset-supply-readprdct']);
      },
      error: (e) => console.error("PATCH ERROR:", e),
    });
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      categ: null,
      name: '',
      barcode: '',
      qty: 1,
      um: null,
      target: 0,
      reorder: 0,
      minimum: 0,
    });
  }

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
  
  onSearch(text: string) {
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




