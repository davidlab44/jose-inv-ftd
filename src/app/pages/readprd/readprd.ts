import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController, Config, IonSearchbar } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { OpportunityService } from '../../services/opportunity.service';
import { PosOrderService } from '../../services/pos-order.service';
import { TableService } from '../../services/table.service';
import { Session } from '../../interfaces/session';
import { SessionService } from '../../services/session.service';
import { UtilService } from '../../services/util.service';
import { ProductService } from '../../services/product.service';
import { BarcodeService } from '../../services/barcode.service';
import { CategoryService } from '../../services/category.service';
import { UmService } from '../../services/um.service';
import { Product } from '../../interfaces/product';
import { RexService } from '../../services/rex.service';
import { RateClientComponent } from '../../pages/modal/rate-client/rate-client.component';
import { ExcelService } from '../../services/local/excel.service';
declare const require: any;
const shared = require('./readprd.js');
@Component({
  selector: 'page-readprd',
  templateUrl: 'readprd.html',
  styleUrls: ['./readprd.scss']
})
export class ReadprdPage {
  @ViewChild('searchbar', { static: false }) searchbar!: IonSearchbar;
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
  queryText: any;
  mesas: any[] = [];
  activeSession: Session | null = null;
  sessionId: number | null = null;
  searchSubject = new Subject<string>();
  filteredCategories: any[] = [];
  filteredProductsByCategory: any[] = [];
  hash: string = '';
  table: any;
  posCategId: number = 0;
  productList: any[] = [];
  productListFull: any[] = [];
  categories: any[] = [];
  ums: any[] = [];
  constructor(
    private barcodeService: BarcodeService,
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    private modalController: ModalController,
    public config: Config,
    private opportunityService: OpportunityService,
    private posOrderService: PosOrderService,
    private tableService: TableService,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private utilService: UtilService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private umService: UmService,
    private rexService: RexService,
    private excelService: ExcelService
  ) {}
  ngOnInit() {
    this.refreshView();
  }
  ionViewWillEnter() {
    this.refreshView();
  }
  refreshView() {
    this.loadCategories();
    this.loadUms();
    this.getAllProducts();
    this.getAllProductsFull();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(text => {
        const query = text.trim().toLowerCase();
        if (!query.length) {
          this.productList = this.productListFull.slice(0, 20);
          return;
        }
        const f = shared.filterByCategory(this.categories, this.productListFull, text);
        this.filteredCategories = f.filteredCategories;
        this.filteredProductsByCategory = f.filteredProductsByCategory;
      }),
      switchMap(text => this.productService.searchProducts(text))
    ).subscribe({
      next: results => {
        this.productList = shared.mergeProducts(results, this.filteredProductsByCategory);
      },
      error: err => console.error('Error en búsqueda:', err)
    });
  }
  updateSchedule() {}
  ionViewDidEnter() {}
  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: r => {
        this.productList = r;
      },
      error: e => console.error('Error:', e)
    });
  }
  getAllProductsFull() {
    this.productService.getAll().subscribe({
      next: r => {
        this.productListFull = r;
      },
      error: e => console.error('Error:', e)
    });
  }
  searchProducts(hash: string, list: any[]): any[] {
    return shared.searchProducts(hash, list);
  }
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: r => {
        this.categories = r;
        this.categoryService.saveCategoriesToLocal(r);
      },
      error: e => {
        console.error('Error categorías:', e);
        this.categories = this.categoryService.getCategoriesFromLocal();
      }
    });
  }
  loadUms() {
    this.umService.getAllUms().subscribe({
      next: r => {
        this.ums = r;
        this.umService.saveUmsToLocal(r);
      },
      error: e => {
        console.error('Error UMs:', e);
        this.ums = this.umService.getUmsFromLocal();
      }
    });
  }
  getCategoryNameById(id: number | null | undefined): string {
    return shared.getCategoryNameById(this.categories, id);
  }
  getUmNameById(id: number | string | null | undefined): string {
    return shared.getUmNameById(this.ums, id);
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
    return items;
  }
  out(item: any) {
    this.router.navigate(['/app/tabs/asset-supply-out'], { state: { item } });
  }
  patch(item: any) {
    this.router.navigate(['/app/tabs/asset-supply-patch'], { state: { item } });
    this.clearSearch();
  }
  clearSearch() {
    this.searchSubject.next('');
  }
  delete(p: any) {
    this.productService.delete(p.id).subscribe({
      next: r => console.log('delete response', r)
    });
  }
  manualOutbound(item: any) {
    this.router.navigate(['/app/tabs/schedule'], { state: { item } });
  }
  printSelectedBarcodes(p: Product) {
    const paddedId = p.id.toString().padStart(6, '0');
    this.barcodeService.printIn50mmPortablePrinterBt(p.data.name, [paddedId], p.id.toString());
  }
  async openModal(p: any) {
    const modal = await this.modalController.create({
      component: RateClientComponent,
      componentProps: { items: p }
    });
    return modal.present();
  }
  downloadExcel() {
    this.excelService.exportInventory(this.productList, this.ums, this.categories, 'products');
  }
}
