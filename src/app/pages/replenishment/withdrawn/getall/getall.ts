import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
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
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';

@Component({
  selector: 'page-getall',
  templateUrl: 'getall.html',
  styleUrls: ['./getall.scss'],
})
export class GetallPage implements OnInit {





withdrawnList: any[] = [];
















getTotalKg(): number {
  if (!this.withdrawnList || this.withdrawnList.length === 0) {
    return 0;
  }

  return this.withdrawnList.reduce((total, p) => {
    const akg = Number(p?.data?.akg) || 0;
    const bkg = Number(p?.data?.bkg) || 0;
    return total + akg + bkg;
  }, 0);
}














  /*// Rango seleccionado (día del año)*/
  /*dayRange = {*/
    /*lower: 1,*/
    /*upper: 365*/
  /*};*/

  /*// Valores individuales*/
  /*startDay = 1;*/
  /*endDay = 365;*/


  /*onRangeChange(event: any) {*/
    /*this.startDay = event.detail.value.lower;*/
    /*this.endDay = event.detail.value.upper;*/

    /*console.log('Desde:', this.formatDay(this.startDay));*/
    /*console.log('Hasta:', this.formatDay(this.endDay));*/
  /*}*/

  /*// Sincroniza valores al iniciar*/
  /*syncDays() {*/
    /*this.startDay = this.dayRange.lower;*/
    /*this.endDay = this.dayRange.upper;*/
  /*}*/

  /*// Convierte día del año → "DD Mes"*/
  /*formatDay(day: number): string {*/
    /*const base = new Date('2026-01-01T00:00:00');*/
    /*base.setDate(base.getDate() + (day - 1));*/

    /*return base.toLocaleDateString('es-ES', {*/
      /*day: '2-digit',*/
      /*month: 'short'*/
    /*});*/
  /*}*/




















  dayRange = {
    lower: 1, // inicio del año
    upper: this.getTodayDayOfYear() // 👈 hoy
  };

  startDay = 1;
  endDay = this.dayRange.upper;


  onRangeChange(event: any) {
    this.startDay = event.detail.value.lower;
    this.endDay = event.detail.value.upper;

    console.log('Desde:', this.formatDay(this.startDay));
    console.log('Hasta:', this.formatDay(this.endDay));
  }

  syncDays() {
    this.startDay = this.dayRange.lower;
    this.endDay = this.dayRange.upper;
  }

  formatDay(day: number): string {
    const base = new Date('2026-01-01T00:00:00');
    base.setDate(base.getDate() + (day - 1));

    return base.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  }








  getTodayDayOfYear(): number {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff =
      today.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000;

    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }







































  // ==============================
  // Opciones de los selects
  // ==============================

  types = [
    { value: 1, name: 'Nacional' },
    { value: 2, name: 'Importado' }
  ];

  vendors = [
    { value: 1, name: 'Plexa' },
    { value: 2, name: 'Plexa port' }
  ];

  // ==============================
  // Valores seleccionados (default)
  // ==============================

  filterType: number = this.types[0].value;
  filterVendor: number = this.vendors[0].value;

  onTypeChange(event: any) {
    const value = event?.detail?.value ?? this.filterType;
    this.filterType = value;
    console.log('Tipo seleccionado:', value);
  }

  onVendorChange(event: any) {
    const value = event?.detail?.value ?? this.filterVendor;
    this.filterVendor = value;
    console.log('Vendor seleccionado:', value);
  }




/*columns = [*/
    /*{ header: 'Fecha V', field: 'fecha_v' },*/
    /*{ header: 'Cont vacío', field: 'cont_vacio' },*/
    /*{ header: 'Rem vacío', field: 'rem_vacio' },*/
    /*{ header: 'Fe ing M', field: 'fe_ing_m' },*/
    /*{ header: 'Rem M ll', field: 'rem_m_ll' },*/
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
    /*{ header: 'Peso Lleno B', field: 'peso_lleno_b' },*/
    /*{ header: 'P Neto', field: 'p_neto' },*/
    /*{ header: 'DIF', field: 'dif' },*/
    /*{ header: 'Precio P', field: 'precio_p' },*/
    /*{ header: 'Fecha F', field: 'fecha_f' },*/
    /*{ header: 'Factura', field: 'factura' },*/
    /*{ header: 'Valor Fact', field: 'valor_fact' },*/
    /*{ header: 'Sello 1', field: 'sello1' },*/
    /*{ header: 'Sello 2', field: 'sello2' },*/
    /*{ header: 'Sello 3', field: 'sello3' }*/
  /*]; */

  patchThisElement(item:any){
    this.router.navigate(
      ['/app/tabs/withdrawn-patch'],
      { state: { item } }
    );
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  ngOnInit() {
     this.syncDays();
    this.loadData();
  }

  loadData() {
    this.withdrawnService.getAll().subscribe((resp) => {
      this.withdrawnList = resp;
      console.log('DATA:', this.withdrawnList);
    });
  }

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
  todayDate:any

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
    private withdrawnService: WithdrawnService
  ) {}

  /*printSelectedBarcodes(p: Product) {*/
    /*const paddedId = p.id.toString().padStart(6, '0');*/
    /*const selectedBarcodes = [paddedId];*/
    /*this.barcodeService.printIn50mmPortablePrinterBt(selectedBarcodes);*/
  /*}*/

  hash:string='';
  table:any
  userList:any[]=[];
  loadUsers(){
    this.userService.getAll().subscribe({
      next: (response)=>{
        console.log("users",response)
        this.userList=response;
      }
    })
  }

  updateSchedule(){
     
  }

  productListCaos:any[]=[];
  ionViewWillEnter() {
    this.productService.getCachedOrServer().subscribe(data => {
      this.productListCaos = data;
    });
    this.getAll();
  }

  getAll(){
    this.withdrawnService.getAll().subscribe({
      next: response=>{
        console.log("response gettall withdrawn",response);
      }
    })
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




}




