import { ChangeDetectorRef } from '@angular/core';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonList,
  LoadingController,
  ModalController,
  ToastController,
  Config,
  IonItemSliding
} from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { OpportunityService } from '../../../../services/opportunity.service';
import { PosOrderService } from '../../../../services/pos-order.service';
import { TableService } from '../../../../services/table.service';
import { ActivatedRoute } from '@angular/router';
import { Session } from '../../../../interfaces/session';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../interfaces/product';
import { DateService } from '../../../../services/local/date.service';
import { RexService } from '../../../../services/rex.service';
import { ProdrexService } from '../../../../services/prodrex.service';
import { UserService } from '../../../../services/user.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'page-getall',
  templateUrl: 'getall.html',
  styleUrls: ['./getall.scss'],
})
export class GetallPage implements OnInit {

  @ViewChild(IonList, { static: false }) ionList!: IonList;
  searchSubject: Subject<string> = new Subject();
  withdrawnList: any[] = [];
  filteredWithdrawnList: any[] = [];
  fullWithdrawnList: any[] = [];
  dayRange = {
    lower: 1,
    upper: this.getTodayDayOfYear()
  };
  startDay = 1;
  endDay = this.dayRange.upper;
  types = [
    { value: 1, name: 'Nacional' },
    { value: 2, name: 'Importado' }
  ];
  vendors = [
    { value: 1, name: 'Plexa' },
    { value: 2, name: 'Plexa port' }
  ];
  filterType: number = this.types[0].value;
  filterVendor: number = this.vendors[0].value;
  valor1 = 0;
  valor2 = 0;
  valor3 = 0;
  valor4 = 0;
  ios: boolean;
  showSearchbar: boolean;
  //searchSubject = new Subject<string>();
  //ccoList: any[] = [];
  displayToEnevis=true;
  
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
    private sessionService: SessionService,
    private utilService: UtilService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private dateService: DateService,
    private rexService: RexService,
    private prodrexService: ProdrexService,
    private userService: UserService,
    private withdrawnService: WithdrawnService,
    private ccoService: CcoService,
    //private cd: ChangeDetectorRef,
  ) {}

  /*ngOnInit() {*/
    /*this.syncDays();*/
    /*this.loadCcos();*/
  /*}*/

  ngOnInit() {
    this.initDefaultRange(30);
    this.loadCcos();
    this.displayToEnevis=false;//esto es para que muestre todo los elementos que coincidan 
    this.filteredWithdrawnList = [...this.withdrawnList];
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((text: string) => {
      console.log('withdrawnList size', this.withdrawnList.length);
      const value = text.toLowerCase().trim();
      this.filteredWithdrawnList = this.withdrawnList.filter(item =>
        JSON.stringify(item).toLowerCase().includes(value)
      );
      console.log(
        'filtered size',
        this.filteredWithdrawnList.length
      );
    });
  }

  onSearch2(event: any) {
    console.log('event',event)  
    const value = event || '';
    this.searchSubject.next(value);
  }

  ionViewWillEnter() {
    this.getAll();
  }

  getAll() {
    const since = this.dayOfYearToISO(this.startDay);
    const until = this.dayOfYearToISO(this.endDay, true);
    this.withdrawnService.getIntervalByCreatedAtDate(since, until).subscribe({
      next: response => {
        this.withdrawnList = response;
        console.log("withdrawnList response",this.withdrawnList)
        this.fillFullWithdrawnList();
      }
    });
  }

  sortWithdrawnByDate(withdrawnList: any[]): any[] {
    return withdrawnList.sort((a, b) => {
      const dateA = new Date(a.data.date).getTime();
      const dateB = new Date(b.data.date).getTime();
      return dateA - dateB;
    });
  }

  sortWithdrawnByIdDesc(withdrawnList: any[]): any[] {
    return withdrawnList.sort((a, b) => {
      return b.id - a.id;
    });
  }

  trackByGroup(index: number, group: any): string {
    return group.refdate + '-' + index;
  }

  getTotalKg(): number {
    if (!this.withdrawnList?.length) return 0;
    return this.withdrawnList.reduce((total, p) => {
      const kg = Number(p?.data?.kg) || 0;
      return total + kg;
    }, 0);
  }

  onRangeChange(event: any) {
    this.startDay = event.detail.value.lower;
    this.endDay = event.detail.value.upper;
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
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  dayOfYearToISO(day: number, endOfDay = false): string {
    const year = 2026;
    const date = new Date(year, 0);
    date.setDate(day);
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString().slice(0, 19);
  }

  changeStartDay(delta: number) {
    this.startDay = Math.max(1, Math.min(365, this.startDay + delta));
    // evitar que supere endDay
    if (this.startDay > this.endDay) {
      this.startDay = this.endDay;
    }
    this.updateRangeAndFetch();
  }

  changeEndDay(delta: number) {
    this.endDay = Math.max(1, Math.min(365, this.endDay + delta));
    // evitar que sea menor que startDay
    if (this.endDay < this.startDay) {
      this.endDay = this.startDay;
    }
    this.updateRangeAndFetch();
  }

  private rangeTimeout: any;

  updateRangeAndFetch() {
    this.dayRange = {
      lower: this.startDay,
      upper: this.endDay
    };
    clearTimeout(this.rangeTimeout);
    this.rangeTimeout = setTimeout(() => {
      this.getAll();
    }, 1000);
  }

  quickRange(ev: any) {
    const today = this.getTodayDayOfYear();
    if (ev.detail.value === 'today') {
      this.startDay = today;
      this.endDay = today;
    }
    if (ev.detail.value === 'week') {
      this.startDay = today - 7;
      this.endDay = today;
    }
    if (ev.detail.value === 'month') {
      this.startDay = today - 30;
      this.endDay = today;
    }
    this.updateRangeAndFetch();
  }

  initDefaultRange(days: number) {
    const today = this.getTodayDayOfYear();
    this.dayRange = {
      lower: Math.max(1, today - days),
      upper: today
    };
    this.syncDays();
  }

  calcularResultado(): number {
    return (this.valor1 || 0) * (this.valor2 || 0);
  }

  calcularResultadoImportado(): number {
    return (this.valor3 || 0) * (this.valor4 || 0);
  }

  setValor(valor: number) {
    this.valor1 = valor;
  }

  onTypeChange(event: any) {
    this.filterType = event?.detail?.value ?? this.filterType;
  }

  onVendorChange(event: any) {
    this.filterVendor = event?.detail?.value ?? this.filterVendor;
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  formatFechaLatam(dateInput: string | Date | number): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const fechaTexto = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);

    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const segundos = String(date.getSeconds()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12;
    if (horas === 0) horas = 12;
    return `${fechaTexto} ${String(horas).padStart(2, '0')}:${minutos}:${segundos} ${ampm}`;
  }

  private calculateDiff(group: any): void {
    if (group.type === 'pair') {
      const kg1 = Number(group.items[0]?.data?.kg) || 0;
      const kg2 = Number(group.items[1]?.data?.kg) || 0;
      const wnet = Number(group.items[0]?.data?.wnet) || 0;
      let diff = 0;
      if (wnet !== 0) {
        const subtotalKg = kg1 + kg2;
        diff = subtotalKg - wnet;
      }
      group.items[0].diff = diff;
      group.items[1].diff = diff;
    } else {
      const kg = Number(group.items[0]?.data?.kg) || 0;
      const wnet = Number(group.items[0]?.data?.wnet) || 0;
      let diff = 0;
      if (wnet !== 0) {
        diff = kg - wnet;
      }
      group.items[0].diff = diff;
    }
  }

  plexaUploader(item:any){
    //console.log("item to patch",item);
    this.router.navigate(    
      ['/app/tabs/replenishment-in-post'], 
      { state: { item } }    
    );
  } 

  patch(withdrawn: any, page: any) {
    const pageRoute = `/app/tabs/replenishment-${page}-patch`;
    this.router.navigate([pageRoute], {
      state: {
        item: withdrawn,
        list: this.withdrawnList
      }
    });
  }

  async  cloneWithdrawn(item: any) {
    console.log("item pasado:", item);
    //chatgpt => agregar al payload en data.twin el item.id
    const payload = this.buildClonePayload(item);
    console.log("Payload a enviar:", payload);
    this.withdrawnService.postClone(payload).subscribe({
      next: (response) => {
        console.log("Clone creado", response);
        //chatgpt => hacer un patch a este "withdrawnItem" data.twin el que se creo
        this.selfPatch(item,response[0].id);
        this.getAll();
      },
      error: (err) => {
        console.error("Error al clonar", err);
      }
    });
  }

  buildClonePayload(item: any): any {
    //  Soporta tanto data plano como data.data (por si hay registros viejos mal guardados)
    const d = item?.data?.data ?? item?.data ?? {};
    return {
      ext_id: null,
      // ⚠️ Puedes cambiar esto a new Date().toISOString() si quieres que sea "nuevo"
      created_at: item.created_at,
      updated_at: item.created_at,
      data: {
        // RESET
        kg: 0,
        img: "",
        psi: 0,
        date: d.date ?? null,
        name: 0,
        seal: [],
        twin: item.id,
        price: 0,
        id_replenishment_product: 0,
        imgin: null,
        shipin: 0,
        ticket: "",
        tripin: "",
        vendor: 0,
        datein: "",
        // MANTENER w*
        wnet: d.wnet ?? 0,
        wtare: d.wtare ?? 0,
        wgross: d.wgross ?? 0,
        wticket: d.wticket ?? 0,
        // MANTENER *out
        imgout: d.imgout ?? null,
        dateout: d.dateout ?? null,
        shipout: d.shipout ?? 0,
        tripout: d.tripout ?? "",
        deliveryout: d.deliveryout ?? 0,
        // OTROS
        imgscale: d.imgscale ?? null,
        rotogate: 0,
        deliveryin: 0
      },
      refdate: null,
      state: "pre-in"
    };
  }

  async selfPatch(item:any,twin:number) {
    item.data.twin=twin;
    console.log("item to selfpatch ",item)
    console.log("d to selfpatch ",item)
    this.withdrawnService.patch(item.id,item.data).subscribe({
      next: (response) => {
        console.log("Withdrawn selfpatch response", response);
      },
      error: (err) => {
        console.error("Withdrawn selfpatch error", err);
      }
    });
  }

  searchTerm: string = ''; 
  get filteredList() {
    if (!this.searchTerm) return this.fullWithdrawnList;
    const term = this.searchTerm.toLowerCase();
    return this.fullWithdrawnList.filter(item =>
      Object.values(item.data).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }

  /*---------cco --------------*/
  private buildCcoMap(ccoList: Cco[]): CcoMap {
    const map: CcoMap = {};
    ccoList.forEach((cco, index) => {
      const id = Number(cco.id); // NORMALIZAR
      //console.log(`cco[${index}] id(normalizado) =>`, id, typeof id);
      map[id] = {
        name: cco.data?.name ?? 'N/A',
        color: cco.data?.color ?? '#ccc'
      };
    });
    return map;
  }

  ccoList: Cco[] = [];
  ccoMap: CcoMap = {};

  loadCcos() {
    this.ccoService.getAll().subscribe({
      next: (ccos) => {
        //console.log('ccoList RAW =>', ccos);
        this.ccoList = ccos;
        this.ccoMap = this.buildCcoMap(ccos);
        //console.log('ccoMap =>', this.ccoMap);
        //console.log('ccoMap keys =>', Object.keys(this.ccoMap));
        this.debugCcoMapping();
      },
      error: (err) => console.error('Error loading ccos', err)
    });
  }

  debugCcoMapping() {
    this.filteredList.slice(0, 10).forEach((item, i) => {
      const ccoId = item?.data?.name;
      //console.log(`item[${i}] ccoId =>`, ccoId, 'tipo:', typeof ccoId);
      const cco = this.ccoMap[ccoId];
      if (!cco) {
        console.warn(`NO MATCH para ccoId=${ccoId}`, {
          availableKeys: Object.keys(this.ccoMap)
        });
      } else {
        console.log(`MATCH ccoId=${ccoId} =>`, cco);
      }
    });
  }

  presentFilter(){
    this.displayToEnevis=!this.displayToEnevis;
    console.log('display to enevis',this.displayToEnevis.toString())
  }

  findMostRecentMovement(name: number): any | null {
    return this.withdrawnList.reduce((max, item) => {
      if (item?.data?.name !== name) {
        return max;
      }
      if (!max || item.id > max.id) {
        return item;
      }
      return max;
    }, null);
  }

  /*[>---- CCO------ <]*/
  onCcoSearch(text: string) {
    console.log('text to search',text)
    this.applyFilter(text);  
  }  
  applyFilter(text: string) {
    if (!text || text.trim() === '') {
      this.topFilteredList = this.ccoList;
      return;
    }
    const search = text.trim().toLowerCase();
    this.topFilteredList = this.ccoList.filter(item => {
      const name = (item?.data?.name || '').toLowerCase();
      return name.includes(search);
    });
    console.log('topFilteredList', this.topFilteredList);
  }
  topFilteredList: any[] = [];     //lista filtrada
  ccoName: string = '';   // nombre a mostrar
  ccoId: number = 0;   // id cco seleccionado a mostrar
  selectCco(item: any) {
    this.cco = item;
    this.ccoName = item.data.name;
    this.ccoId = item.id;
    //actualizar movement (muy importante en tu flujo)
    console.log('item pasado:', item);
    console.log('cco name:', this.ccoName);
    console.log('cco id:', this.ccoId);
    this.findMostRecentMovementOfIsotanq(this.ccoId);
  }
  cco:any;  
  isotanq:any;
  ccos: any[] = []; 

  /*-------isotanq main -------*/
  /*  findMostRecentMovementOfIsotanq(ccoId:number){*/
    /*this.fullWithdrawnList=[];*/
    /*const isotanqMain=this.ccoService.findMostRecentMovementOfIsotanq(this.withdrawnList,ccoId);*/
    /*console.log('isotanqMain',isotanqMain)*/
    /*this. fullWithdrawnList.push(isotanqMain); */
    /*console.log(Array.isArray(this.fullWithdrawnList));*/
    /*console.log(this.fullWithdrawnList);*/
    /*console.log(this.fullWithdrawnList.length);*/
  /*}*/

  findMostRecentMovementOfIsotanq(ccoId:number){
    this.fullWithdrawnList=[];
    const isotanqMain=this.ccoService.findMostRecentMovementOfIsotanq(this.withdrawnList,ccoId);
    console.log('isotanqMain',isotanqMain);
    if(!isotanqMain){
      console.log('No se encontró isotanque para ccoId',ccoId);
      return;
    }
    this.fullWithdrawnList=[isotanqMain];
    console.log('fullWithdrawnList',this.fullWithdrawnList);
    console.log('length',this.fullWithdrawnList.length);
  }

  fillFullWithdrawnList(){
    this.fullWithdrawnList=this.sortWithdrawnByIdDesc(this.withdrawnList);
    console.log('full',this,this.fullWithdrawnList)
  }

  viajanJuntosList:any[]=[];
  discoverTwins(p: any) {
    this.viajanJuntosList=[];
    this.viajanJuntosList.push(p);
    console.log('twin', p.data.twin);
    const id2 = p.data.twin;
    if (Number(id2)) {
      const twin = this.withdrawnList.find(
        item => item.id == id2
      );
      console.log('twin found:', twin);
      if(twin && twin != undefined)
        this.viajanJuntosList.push(twin);
      console.log('viajenJuntosList',this.viajanJuntosList)
    }
  }

  /*showTwins(p:any){*/
    /*console.log('contenedor twin or single',p)*/
    /*console.log('twin',p.data.twin)*/
    /*const id2=p.data.twin;*/
    /*if(Number(id2)){*/
      /*const twin=this.withdrawnList.find(*/
        /*(item)=>{*/
          /*item.data.id==id2;*/
        /*}*/
      /*)  */
    /*}*/
 
  /*}*/

  hookList(list:any[]){
    console.log('HOOK LIST',list);
  }



}



