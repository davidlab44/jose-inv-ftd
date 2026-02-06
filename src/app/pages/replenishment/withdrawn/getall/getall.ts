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
    console.log('Hasta2', this.formatDay(this.endDay));
    
    this.getAll();
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



  getAll() {
    const since = this.dayOfYearToISO(this.startDay);
    const until = this.dayOfYearToISO(this.endDay, true);

    console.log('Filtro real desde:', since);
    console.log('Filtro real hasta:', until);

    this.withdrawnService.getInterval(since, until).subscribe({
      next: response => {
        this.withdrawnList = response;
        console.log('Withdrawn filtrados:', response);
      },
      error: err => console.error('Error filtro:', err)
    });
  }


  /*getAll(){*/
    /*console.log('entro en getall')*/
    /*console.log('startDay',this.startDay.toString());*/
    /*console.log('endDay',this.endDay.toString());*/
    /*[>    this.withdrawnService.getInterval(this.startDay.toString(),this.endDay.toString()).subscribe({<]*/
      /*[>next: response=>{<]*/
        /*[>console.log("response gettall withdrawn",response);<]*/
      /*[>}<]*/
    /*[>})<]*/
  /*}*/

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


  dayOfYearToISO(day: number, endOfDay = false): string {
    const year = 2026; // o dinámico si quieres
    const date = new Date(year, 0); // 1 enero
    date.setDate(day);

    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    // formato compatible con PostgREST
    return date.toISOString().slice(0, 19);
  }



}




