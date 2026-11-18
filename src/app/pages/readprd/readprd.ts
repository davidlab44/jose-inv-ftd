import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ModalController, ToastController, Config, IonSearchbar } from '@ionic/angular';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
    //this.refreshView();
  }
  refreshView() {
    this.loadCategories();
    this.loadUms();
    this.getAllProducts();
    this.getAllProductsFull();
    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(text => this.applySearch(text));
  }

  private normalize(value: any): string {
    return String(value == null ? '' : value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim().toLowerCase();
  }

  private categoryMatches(product: any, matchingIds: Set<number>): boolean {
    const ids = product?.data?.categ;
    return Array.isArray(ids) && ids.some((id: any) => matchingIds.has(Number(id)));
  }

  private mergeProducts(...lists: any[][]): any[] {
    const found = new Map<string, any>();
    for (const list of lists) {
      for (const item of (Array.isArray(list) ? list : [])) {
        if (item && item.id != null) found.set(String(item.id), item);
      }
    }
    return Array.from(found.values());
  }

  private applySearch(text: string): void {
    this.queryText = text || '';
    const query = this.normalize(this.queryText);
    if (!query) {
      this.filteredCategories = [];
      this.filteredProductsByCategory = [];
      this.productList = this.mapProducts(this.productListFull.slice(0, 20));
      return;
    }

    this.filteredCategories = this.categories.filter(cat =>
      this.normalize(cat?.data?.name).includes(query) ||
      this.normalize(cat?.data?.name_es_CO).includes(query)
    );
    const ids = new Set<number>(this.filteredCategories.map(c => Number(c.i)));
    this.filteredProductsByCategory = this.productListFull.filter(p => this.categoryMatches(p, ids));
    const byName = this.productListFull.filter(p => this.normalize(p?.data?.name).includes(query));
    this.productList = this.mapProducts(this.mergeProducts(byName, this.filteredProductsByCategory));
  }

  private mapProducts(products: any[]): any[] {
    return products.map(item => ({
      ...item,
      ctgname: this.getCategoryNameById(item?.data?.categ?.[0])
    }));
  }

  updateSchedule() {}
  ionViewDidEnter() {}
  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: r => {
        this.productList = this.mapProducts(Array.isArray(r) ? r : []);
        if (!this.productListFull.length) this.productListFull = [...this.productList];
        this.applySearch(this.queryText || '');
      },
      error: e => console.error('Error al cargar productos:', e)
    });
  }

  getAllProductsFull() {
    this.productService.getAll().subscribe({
      next: r => {
        this.productListFull = Array.isArray(r) ? r : [];
        this.applySearch(this.queryText || '');
      },
      error: e => console.error('Error al cargar inventario completo:', e)
    });
  }

  searchProducts(hash: string, list: any[]): any[] {
    const query = this.normalize(hash);
    return !query ? list : list.filter(p => this.normalize(p?.data?.name).includes(query));
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: r => {
        this.categories = r;
        this.categoryService.saveCategoriesToLocal(r);
        this.applySearch(this.queryText || '');
      },
      error: e => {
        console.error('Error categorías:', e);
        this.categories = this.categoryService.getCategoriesFromLocal() || [];
        this.applySearch(this.queryText || '');
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

  mapProductList(): void {
    this.productList = this.mapProducts(this.productList);
  }

  getCategoryNameById(id: number | null | undefined): string {
    if (id == null) return 'Sin categoría';
    const cat = this.categories.find(c => Number(c.i) === Number(id));
    const name = cat?.data?.name_es_CO || cat?.data?.name;
    return typeof name === 'string' && name.trim() ? name : 'Sin categoría';
  }

  getUmNameById(id: number | string | null | undefined): string {
    if (id == null || id === '') return 'Sin UM';
    const um = this.ums.find(u => Number(u.id) === Number(id));
    const name = um?.data?.name;
    return typeof name === 'string' && name.trim() ? name : 'Sin UM';
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }
/*  enviar() {*/
    /*const items = [*/
      /*{*/
        /*ext_id: 101,*/
        /*data: {*/
          /*nombre: 'Producto de prueba',*/
          /*precio: 249.90,*/
          /*categoria: 'Electrónica',*/
          /*stock: 12*/
        /*}*/
      /*},*/
      /*{*/
        /*ext_id: 102,*/
        /*data: {*/
          /*nombre: 'Audífonos Bluetooth',*/
          /*precio: 89.50,*/
          /*categoria: 'Accesorios',*/
          /*stock: 50*/
        /*}*/
      /*}*/
    /*];*/
    /*return items;*/
  /*}*/
  out(item: any) {
    this.router.navigate(['/app/tabs/asset-supply-out'], { state: { item } });
  }
  patch(item: any) {
    this.router.navigate(['/app/tabs/asset-supply-patch'], { state: { item } });
    this.clearSearch();
  }
  clearSearch() {
    this.searchSubject.next('');
    this.applySearch('');
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
