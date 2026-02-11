import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { GlppricesService } from '@services/replenishment/glpprices.service';
import { PosOrderService } from '@services/pos-order.service';
import { TableService } from '@services/table.service';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../../../interfaces/session';
import { SessionService } from '@services/session.service';
import { UtilService } from '@services/util.service';
import { ProductService } from '@services/product.service';
import { BarcodeService } from '@services/barcode.service';
import { CategoryService } from '@services/category.service';
import { UmService } from '@services/um.service';
import { Product } from '../../../../interfaces/product';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DateService } from '@services/local/date.service';
import { RexService } from '@services/rex.service';
import { ProdrexService } from '@services/prodrex.service';
import { UserService } from '@services/user.service';
import { ShipService } from '../../../../services/logistic/ship.service';
import { ReplenishmentService } from '@services/replenishment/replenishment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class PostPage {

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
  shipList: any[] = [];
  priceList: any[] = [];

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
    private glppricesService: GlppricesService,
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
    private shipService: ShipService,
    private withdrawnService: WithdrawnService
  ) {}

  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {

    const now = new Date().toISOString();

    this.form = this.fb.group({
      adate: [now],
      avendor: [''],
      aname: [''],
      aprice: [''],
      apsi:0,
      arotogate:0,
      akg: [''],
      aseal1: [''],
      aseal2: [''],
      aseal3: [''],
      aticket: [''],
      adatein: [now],
      adeliveryin: [''],
      atripin: [''],
      ashipin: [''],
      adateout: [now],
      adeliveryout: [''],
      atripout: [''],
      aextra1: [''],
      aextra2: [''],
      ashipout: [''],     
      bdate: [now],
      bvendor: [''],
      bname: [''],
      bprice: [''],
      bpsi:0,
      brotogate:0,
      bkg: [''],
      bseal1: [''],
      bseal2: [''],
      bseal3: [''],
      bticket: [''],
      bdatein: [now],
      bdeliveryin: [''],
      btripin: [''],
      bshipin: [''],
      bdateout: [now],
      bdeliveryout: [''],
      btripout: [''],
      bshipout: [''],     
      bextra1: [''],
      bextra2: [''],
      empty: [''],
      tare: [''],
      full: [''],
    });
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
    this.getAll();
    this.getAllShips();
  }

   getAll(){
    this.withdrawnService.getAll().subscribe((data: any[]) => {
      this.replenishmentList = data;
    });
  }

  getAllShips(){
    this.shipService.getAll().subscribe((data: any[]) => {
      this.shipList = data;
    });
  }

  getPrices(){
    this.glppricesService.getLast20().subscribe((data: any[]) => {
      this.priceList = data;
    });
  }

  guardar() {
    const data: any = this.form.value;
    console.log('ReplenishmentData =>', data);
        
    /*this.withdrawnService.post(data).subscribe({*/
      /*next: response=>{*/
        /*this.utilService.presentToast("retiro registrado exitosamente");*/
        /*console.log("replenishment post response",response)*/
        /*this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceUrl: true });*/
      /*}*/
    /*})*/
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

}




