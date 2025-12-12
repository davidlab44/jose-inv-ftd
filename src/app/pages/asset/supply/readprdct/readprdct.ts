import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
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
import { RexService } from '../../../../services/rex.service';

@Component({
  selector: 'page-readprdct',
  templateUrl: 'readprdct.html',
  styleUrls: ['./readprdct.scss'],
})
export class AssetSupplyReadprdctPage {

  ios: boolean;
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
    private rexService: RexService
  ) {}

/*  printSelectedBarcodes(p: Product) {*/
    /*const paddedId = p.id.toString().padStart(6, '0');*/
    /*const selectedBarcodes = [paddedId];*/
    /*this.barcodeService.downloadPDF(selectedBarcodes);*/
  /*}*/

filteredCategories: any[] = [];
filteredProductsByCategory: any[] = [];

  hash:string='';
  table:any
  async ngOnInit() {
    console.log("ngOnInit")
    await this.loadCategories();
    await this.loadUms();
    this.getAllProducts();
    this.getAllProductsFull();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),




      tap(text => {


        const query = text.trim().toLowerCase();
        if (query.length === 0) {
          this.productList = this.productListFull.slice(0, 20);
          console.log("Restaurando primeros 20 productos:", this.productList);
          return; 
        }


        this.filteredCategories = this.categories.filter(cat => {
            const nombre = cat?.data?.nombre?.toLowerCase() || "";
            const coincide = nombre.includes(text.toLowerCase());
            return coincide;
          });

        const ids = this.filteredCategories.map(c => Number(c.id));

        this.filteredProductsByCategory = this.productListFull.filter(prod =>
          ids.includes(Number(prod?.data?.categ?.[0]))
        );

        console.log("Productos filtrados por categoría:", this.filteredProductsByCategory);
      }),

      // 4. SEGUIR HACIENDO BÚSQUEDA REMOTA
      switchMap(text => this.productService.searchProducts(text))

    )
    .subscribe({
      next: results => {

        // 1. Unir ambos arreglos
        const combined = [...results, ...this.filteredProductsByCategory];

        // 2. Eliminar duplicados por id
        this.productList = combined.filter(
          (item, index, self) =>
            index === self.findIndex(p => p.id === item.id)
        );

        console.log("productList (sin duplicados):", this.productList);
      },
      error: err => console.error("Error en búsqueda:", err)
    });

  }


  updateSchedule(){
  }

  ionViewDidEnter() {}

  posCategId:number=0
  productList:any[]=[];
   getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: response => {
        this.productList=response;
        console.log('products By Cat',this.productList)
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
   }

   productListFull:any[]=[];
   getAllProductsFull() {
      this.productService.getAll().subscribe({
        next: response => {
          this.productListFull=response;
          console.log('products full',this.productListFull)
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
      
    getCategoryNameById(id: number | null | undefined): string {
      if (id === null || id === undefined) {
        return 'Sin categoría';
      }

      if (!Array.isArray(this.categories) || this.categories.length === 0) {
        return 'Sin categoría';
      }

      const cat = this.categories.find(c => Number(c.id) === Number(id));

      const nombre = cat?.data?.nombre;

      return typeof nombre === 'string' && nombre.trim() !== ''
        ? nombre
        : 'Sin categoría';
    }


  getUmNameById(id: number | string | null | undefined): string {
    // Validar ID recibido
    //console.log("id recibido",id)
    if (id === null || id === undefined) {
      return 'Sin UM1';
    }

    const idNum = Number(id);
    if (isNaN(idNum)) {
      return 'Sin UM2';
    }

    // Validar que this.ums exista y tenga elementos
    if (!Array.isArray(this.ums) || this.ums.length === 0) {
      return 'Sin UM3';
    }

    // Buscar la UM por ID
    const um = this.ums.find(u => Number(u.id) === idNum);
    if (!um) {
      return 'Sin UM4';
    }

    // Extraer el nombre si existe y es válido
    const nombre = um?.data?.name;
    if (typeof nombre === 'string' && nombre.trim() !== '') {
      return nombre;
    }

    return 'Sin UM5';
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  enviar() {
    const items = [
      {
        ext_id: 101,
        data: {
          nombre: 'Producto de prueba',
          precio: 249.90,
          categoria: 'Electrónica',
          stock: 12
        }
      },
      {
        ext_id: 102,
        data: {
          nombre: 'Audífonos Bluetooth',
          precio: 89.50,
          categoria: 'Accesorios',
          stock: 50
        }
      }
    ];

    /*this.rexService.addProdrexItems(items).subscribe({*/
      /*next: (resp) => console.log('Respuesta OK:', resp),*/
      /*error: (err) => console.error('Error al enviar:', err)*/
    /*});*/
  }

  patch(item:any){
    console.log("item to patch",item);
    this.router.navigate(
      ['/app/tabs/asset-supply-patch'],
      { state: { item } }
    );
  }


  delete(p){
    this.productService.delete(p.id).subscribe({
      next: (response)=>{
        console.log("delete response",response);

      } 
    })
  }





}







