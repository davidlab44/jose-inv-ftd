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
import { Product } from '../../interfaces/product';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ApplyComponent } from '../modal/apply/apply.component';

  @Component({
    selector: 'page-kitchen',
    templateUrl: 'kitchen.html',
    styleUrls: ['./kitchen.scss'],
  })
  
  export class KitchenPage  {

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
  detalles:any[]=[];

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
    private modalController: ModalController
  ) {}

  printSelectedBarcodes(p: Product) {
    const paddedId = p.id.toString().padStart(6, '0');
    const selectedBarcodes = [paddedId];
    this.barcodeService.downloadPDF(selectedBarcodes);
  }

  hash:string='';
  table:any
  async ngOnInit() {
    await this.loadCategories();
    await this.loadUms();
    this.getAllProducts();
    this.searchSubject.pipe(
      debounceTime(1000),          // espera 1 segundo
      distinctUntilChanged(),      // solo si el texto cambia
      switchMap(text => this.productService.searchProducts(text))
    )
    .subscribe({
      next: results => {
        console.log("Resultados de búsqueda:", results);
        this.productList = results;    // si quieres mostrar los productos encontrados
      },
      error: err => console.error("Error en búsqueda:", err)
    });
  }


  updateSchedule(){
  }

  ionViewDidEnter() {}

  posCategId:number=0
  productList:Product[]=[];
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

  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }


  onSearch(text: string) {
    this.searchSubject.next(text);
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
    const allowedCant = Number(this.product?.data?.qty) - value;
    console.log("allowed", allowedCant);

    if (Number.isNaN(allowedCant)) {
      this.utilService.presentToast("allowedCant is NaN", "danger", 500);
      return;
    }

    if (allowedCant >= 0) {
      this.extraQty += value;
    } else {
      this.utilService.presentToast("No tiene suficiente stock", "danger", 1000);
    }
  }

  confirmAction() {
    const newQty = this.product.data.qty - this.extraQty;
    console.log("newQty",newQty)
    if (newQty >= 0) {
      this.product.data.qty = newQty;
      this.updateProductQty(this.product.id, this.product);
    } else {
      this.utilService.presentToast("No tiene suficiente stockk", "default", 1000);
    }
  }

  updateProductQty(productId:number,data:any){
    this.productService.updateProductQty(productId, data).subscribe({
      next: (res) => {
        console.log('Cantidad actualizada:', res);
      },
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
      }
    });
  }


  openMdl(p:Product){
    console.log("producto pasado",p)
    this.openModal([],p.id, p);
  }


  async openModal(detalles: any[], idQuotation: number, red: any) {
    
    const modal = await this.modalController.create({
      component: ApplyComponent,
      componentProps: {
        items: [red],
        detalles: [this.categories,this.ums] // Puedes pasar los elementos que desees aquí
      },
      cssClass: 'half-screen-modal' // Agregamos la clase CSS personalizada
    });

    modal.onDidDismiss().then((result) => {
      console.log('data de cierre:', result);

      if (result.data?.closedBy === 'customCloseModal') {
        console.log('Cerrado con mi método personalizado 🚀');
      } else {
        console.log('Cerrado con los controles del sistema ✋');
      }
    });

    return await modal.present();
  }

  exitApp() {
    console.log('🛑 Saliendo de la app');
    window.location.href = 'https://www.google.com';
  }


}



















