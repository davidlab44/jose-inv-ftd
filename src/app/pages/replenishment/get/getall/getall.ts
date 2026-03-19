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
import { Ship,ShipMap } from '../../../../interfaces/ship';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../interfaces/product';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
import { RexService } from '../../../../services/rex.service';
import { ProdrexService } from '../../../../services/prodrex.service';
import { UserService } from '../../../../services/user.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { ShipService } from '../../../../services/logistic/ship.service';


@Component({
  selector: 'page-getall',
  templateUrl: 'getall.html',
  styleUrls: ['./getall.scss'],
})
export class GetallPage implements OnInit {

  @ViewChild(IonList, { static: false }) ionList!: IonList;

  withdrawnList: any[] = [];
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
  searchSubject = new Subject<string>();
  ccoList: any[] = [];
  shipList: Ship[] = [];
  shipMap: ShipMap = {};


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
    private shipService: ShipService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.syncDays();
    this.loadShips();
    //this.getCco();
  }

  ionViewWillEnter() {
    this.getAll();
  }

  /*ionViewDidEnter() {*/
    /*this.getAll();*/
  /*}*/

  getAll() {
    const since = this.dayOfYearToISO(this.startDay);
    const until = this.dayOfYearToISO(this.endDay, true);
    this.withdrawnService.getIntervalByAdate(since, until).subscribe({
      next: response => {
        this.withdrawnList = response;
        console.log("withdrawnList response",this.withdrawnList)
        this.fullWithdrawnList=this.sortWithdrawnByDate(this.withdrawnList);
        console.log('full',this,this.fullWithdrawnList)
        //this.groupWithdrawnByRefdate();
        //this.cd.detach();
        setTimeout(() => {
          this.cd.detach();
        }, 10000); // 10000 ms = 10 segundos
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

  /*  getCco() {*/
    /*this.ccoService.getAll().subscribe(resp => {*/
      /*this.ccoList = resp;*/
      /*console.log('ccoList',this.ccoList)*/
    /*});*/
  /*}*/

  /*getCcoNameById(id: number | null | undefined): string {*/
    /*if (id == null) return 'Sin nombre';*/
    /*const cco = this.ccoList.find(c => Number(c.id) === Number(id));*/
    /*const nombre = cco?.data?.name;*/
    /*return typeof nombre === 'string' && nombre.trim() !== ''*/
      /*? nombre*/
      /*: 'Sin Nombre';*/
  /*}*/

  /*getCcoColorById(id: number | null | undefined): string {*/
    /*if (id == null) return '#ffffff';*/
    /*const cco = this.ccoList.find(c => Number(c.id) === Number(id));*/
    /*const color = cco?.data?.color;*/
    /*return typeof color === 'string' && color.trim() !== ''*/
      /*? color*/
      /*: '#ffffff';*/
  /*}*/

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
    console.log("item to patch",item);
    this.router.navigate(    
      ['/app/tabs/replenishment-vendor-post'], 
      { state: { item } }    
    );
  } 

  patch(withdrawn:any,page:any){
    console.log("item to patch",withdrawn);
    console.log("ruta",page);
    const pageRoute=`/app/tabs/replenishment-${page}-patch`;
    console.log("pageRoute",pageRoute);
    this.router.navigate([pageRoute], { state: { item: withdrawn } });
  } 

  trackById(index: number, item: any): number {
    return item.id;
  }

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.fullWithdrawnList.sort((a: any, b: any) => {
      const valA = this.getValue(a, column);
      const valB = this.getValue(b, column);
      if (valA == null) return -1;
      if (valB == null) return 1;
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
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

  getValue(item: any, column: string) {
    return column.includes('data.')
      ? column.split('.').reduce((o, i) => o?.[i], item)
      : item[column];
  }

  private buildShipMap(shipList: Ship[]): ShipMap {
    return shipList.reduce((acc, ship) => {
      acc[ship.id] = {
        name: ship.data?.name ?? 'N/A',
        imo: ship.data?.imo ?? 'N/A'
      };
      return acc;
    }, {} as ShipMap);
  }

  loadShips() {
    this.shipService.getAll().subscribe({
      next: (ships) => {
        this.shipList = ships;
         console.log('shipList',ships);
        // 🔥 construir el map UNA SOLA VEZ
        this.shipMap = this.buildShipMap(ships);

      },
      error: (err) => console.error(err)
    });
  }



}



