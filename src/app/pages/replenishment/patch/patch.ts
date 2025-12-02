import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../providers/conference-data';
import { UserData } from '../../../providers/user-data';
import { OpportunityService } from '../../../services/opportunity.service';
import { PosOrderService } from '../../../services/pos-order.service';
import { TableService } from '../../../services/table.service';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../../interfaces/session';
import { SessionService } from '../../../services/session.service';
import { UtilService } from '../../../services/util.service';
import { ProductService } from '../../../services/product.service';
import { BarcodeService } from '../../../services/barcode.service';
import { CategoryService } from '../../../services/category.service';
import { UmService } from '../../../services/um.service';
import { Product } from '../../../interfaces/product';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DateService } from '../../../services/local/date.service';
import { RexService } from '../../../services/rex.service';
import { ProdrexService } from '../../../services/prodrex.service';
import { UserService } from '../../../services/user.service';
import { ReplenishmentService } from '../../../services/replenishment/replenishment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'page-patch',
  templateUrl: 'patch.html',
  styleUrls: ['./patch.scss'],
})
export class PatchPage {

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

  columns = [
      { header: 'Fecha V', field: 'fecha_v' },
      { header: 'Cont vacío', field: 'cont_vacio' },
      { header: 'Rem vacío', field: 'rem_vacio' },
      { header: 'Fe ing M', field: 'fe_ing_m' },
      { header: 'Rem M LL', field: 'rem_m_ll' },
      { header: 'Sur', field: 'sur' },
      { header: 'Nort', field: 'nort' },
      { header: 'Fecha', field: 'fecha' },
      { header: 'Ticket', field: 'ticket' },
      { header: 'PSI', field: 'psi' },
      { header: 'OPC', field: 'opc' },
      { header: 'IMPO', field: 'impo' },
      { header: 'P Total', field: 'p_total' },
      { header: 'Rotogate', field: 'rotogate' },
      { header: 'P Vacío B', field: 'p_vacio_b' },
      { header: 'Peso lleno B', field: 'peso_lleno_b' },
      { header: 'P Neto', field: 'p_neto' },
      { header: 'Dif', field: 'dif' },
      { header: 'Precio P', field: 'precio_p' },
      { header: 'Fecha F', field: 'fecha_f' },
      { header: 'Factura', field: 'factura' },
      { header: 'Valor Fact', field: 'valor_fact' },
      { header: 'Sello1', field: 'sello1' },
      { header: 'Sello2', field: 'sello2' },
      { header: 'Sello3', field: 'sello3' },
  ];

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
    this.replenishment = this.buildDefaultReplenishment(item);
  }
  
  ngOnInit() {
    this.form = this.fb.group({
      id: [this.replenishment.id],
      ext_id: [this.replenishment.ext_id],
      created_at: [this.replenishment.created_at],
      updated_at: [this.replenishment.updated_at],

      // Campos del objeto DATA
      dif: [this.replenishment.data.dif],
      opc: [this.replenishment.data.opc],
      psi: [this.replenishment.data.psi],
      sur: [this.replenishment.data.sur],
      impo: [this.replenishment.data.impo],
      nort: [this.replenishment.data.nort],
      fecha: [this.replenishment.data.fecha],
      p_neto: [this.replenishment.data.p_neto],
      sello1: [this.replenishment.data.sello1],
      sello2: [this.replenishment.data.sello2],
      sello3: [this.replenishment.data.sello3],
      ticket: [this.replenishment.data.ticket],
      factura: [this.replenishment.data.factura],
      fecha_f: [this.replenishment.data.fecha_f],
      fecha_v: [this.replenishment.data.fecha_v],
      p_total: [this.replenishment.data.p_total],
      fe_ing_m: [this.replenishment.data.fe_ing_m],
      precio_p: [this.replenishment.data.precio_p],
      rem_m_ll: [this.replenishment.data.rem_m_ll],
      rotogate: [this.replenishment.data.rotogate],
      p_vacio_b: [this.replenishment.data.p_vacio_b],
      rem_vacio: [this.replenishment.data.rem_vacio],
      cont_vacio: [this.replenishment.data.cont_vacio],
      valor_fact: [this.replenishment.data.valor_fact],
      peso_lleno_b: [this.replenishment.data.peso_lleno_b]
    });

    console.log("Formulario inicializado:", this.form.value);
  }




  save() {
    if (this.form.valid) {
      console.log("Guardando:", this.form.value);
      // Aquí puedes llamar a tu servicio si deseas
      // this.replenishmentService.update(...)
    }
  }

  getAll(){
    this.replenishmentService.getAll().subscribe((data: any[]) => {
      this.replenishmentList = data;
    });
  }


/*  patchReplenishment(){*/
    /*this.replenishmentService.patch(this.replenishment.id,this.replenishment.data).subscribe({*/
      /*next: (res) => {*/
        /*console.log('replenishment actuacancelLongPress(cancelLongPress(lizada:', res);*/
      /*},*/
      /*error: (err) => {*/
        /*console.error('Error al actualizar cantidad:', err);*/
      /*}*/
    /*});*/
  /*}*/




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



private buildDefaultReplenishment(item: any) {
    const template = {
      id: null,
      ext_id: null,
      created_at: null,
      updated_at: null,
      data: {
        dif: 0,
        opc: 0,
        psi: 0,
        sur: "",
        impo: 0,
        nort: "",
        fecha: "",
        p_neto: 0,
        sello1: "",
        sello2: "",
        sello3: "",
        ticket: "",
        factura: "",
        fecha_f: "",
        fecha_v: "",
        p_total: 0,
        fe_ing_m: "",
        precio_p: 0,
        rem_m_ll: "",
        rotogate: 0,
        p_vacio_b: 0,
        rem_vacio: "",
        cont_vacio: "",
        valor_fact: 0,
        peso_lleno_b: 0
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



}




