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
import { Cco,CcoMap } from '../../../../interfaces/cco';
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
  shipList: Ship[] = [];
  shipMap: ShipMap = {};
  totalGlpOpc:number=0;
  totalGlpImportado:number=0;

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
    //private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.initCurrentMonthRange();
    this.loadShips();
    this.loadCcos();
  }

  ionViewWillEnter() {
    this.getAll();
  }

  totalKg=0;

  getAll() {
    const since = this.dayOfYearToISO(this.startDay);
    const until = this.dayOfYearToISO(this.endDay, true);
    this.withdrawnService.getIntervalByAdate(since, until).subscribe({
      next: response => {
        this.withdrawnList = response;
        console.log("withdrawnList response2",this.withdrawnList)
        this.fullWithdrawnList=this.sortWithdrawnByDateAndSum(this.withdrawnList).reverse();
        console.log('full',this,this.fullWithdrawnList)
      }
    });
  }


  sortWithdrawnByDateAndSum(withdrawnList: any[]): any[] {
    let total = 0;
    let totalOpc = 0;
    let totalImportado = 0;

    const map = new Map<string, any>();

    for (let i = 0; i < withdrawnList.length; i++) {
      const item = withdrawnList[i];
      const data = item.data;

      if (!item.data) item.data = {};
      item.data.diff = 0;

      const kg = Number(data?.kg) || 0;

      // total general
      total += kg;

      // NUEVO: acumuladores por tipo
      if (data?.id_replenishment_product === 1) totalOpc += kg;
      else if (data?.id_replenishment_product === 2) totalImportado += kg;

      const wticket = data?.wticket;

      if (
        wticket !== undefined &&
        Number(data?.wnet) > 0 &&
        Number(data?.wgross) > 0 &&
        Number(data?.wtare) > 0
      ) {
        const key = String(wticket);

        if (map.has(key)) {
          const other = map.get(key);

          const match =
            Number(other.data?.wnet) === Number(data?.wnet) &&
            Number(other.data?.wgross) === Number(data?.wgross) &&
            Number(other.data?.wtare) === Number(data?.wtare);

          if (match) {
            const diff =
              (Number(other.data?.kg) || 0) +
              (Number(data?.kg) || 0) -
              Number(data?.wnet);

            item.data = { ...item.data, diff };
            other.data = { ...other.data, diff };
          }

        } else {
          map.set(key, item);
        }
      }
    }

    withdrawnList.sort((a, b) => a._ts - b._ts);

    //  asignación final (una sola vez)
    this.totalKg = total;
    this.totalGlpOpc = totalOpc;
    this.totalGlpImportado = totalImportado;

    return withdrawnList;
  }



  trackByGroup(index: number, group: any): string {
    return group.refdate + '-' + index;
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

  /*plexaUploader(item:any){*/
    /*console.log("item to patch",item);*/
    /*this.router.navigate(    */
      /*['/app/tabs/replenishment-in-post'], */
      /*{ state: { item } }    */
    /*);*/
  /*} */

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
        //construir el map UNA SOLA VEZ
        this.shipMap = this.buildShipMap(ships);

      },
      error: (err) => console.error(err)
    });
  }

  private buildCcoMap(ccoList: Cco[]): CcoMap {
    const map: CcoMap = {};
    ccoList.forEach((cco, index) => {
      const id = Number(cco.id); // 🔥 NORMALIZAR
      console.log(`➡️ cco[${index}] id(normalizado) =>`, id, typeof id);
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
        console.log('iccoList RAW =>', ccos);
        this.ccoList = ccos;
        this.ccoMap = this.buildCcoMap(ccos);
        console.log('ccoMap =>', this.ccoMap);
        console.log('ccoMap keys =>', Object.keys(this.ccoMap));
        //this.cd.markForCheck();
        // debug cruzado
        this.debugCcoMapping();
      },
      error: (err) => console.error('❌ Error loading ccos', err)
    });
  }

  debugCcoMapping() {
    console.log('🧪 DEBUG withdrawn -> ccoMap');
    this.filteredList.slice(0, 10).forEach((item, i) => {
      const ccoId = item?.data?.name;
      console.log(`🔎 item[${i}] ccoId =>`, ccoId, 'tipo:', typeof ccoId);
      const cco = this.ccoMap[ccoId];
      if (!cco) {
        console.warn(`❌ NO MATCH para ccoId=${ccoId}`, {
          availableKeys: Object.keys(this.ccoMap)
        });
      } else {
        console.log(`✅ MATCH ccoId=${ccoId} =>`, cco);
      }
    });
  }

  toggleState(item: any, ev: any) {
   console.log('item',item)
    const checked = ev.detail.checked;
    item.state = checked ? 'erp' : 'pending';
    console.log('STATE =>', item.state, item);
    this.withdrawnService.updateWithdrawnState(item.id,item.state).subscribe({
      next: response => {
        console.log('Response from server:', response);
      },
      error: err => {
        console.error('Error updating state:', err);
      }
    });
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
    }, 1000); // debounce
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

  exportToExcel() {
    try {
      if (!this.filteredList || this.filteredList.length === 0) return;
      const rows = this.filteredList.map(item => ({
        //ERP eliminado
        "Fecha V": this.formatDate(item.data.date),
        "Isotanq": this.ccoMap[+item.data.name]?.name || 'N/A',
        "Ticket": item.data.ticket,
        "Img": item.data.img || '',
        "Kg": item.data.kg,
        "Price": item.data.price,
        "PSI": item.data.psi,
        "Rotogate": item.data.rotogate,
        "Seal": item.data.seal?.join(', ') || '',
        "Fecha Ing": this.formatDate(item.data.datein),
        "Rem vacío": item.data.deliveryin,
        "Img In": item.data.imgin || '',
        "Trip In": item.data.tripin,
        "Ship In": this.shipMap[item.data.shipin]?.name || 'N/A',
        "Date Out": this.formatDate(item.data.dateout),
        "Rem M LL": item.data.deliveryout,
        "Img Out": item.data.imgout || '',
        "Trip Out": item.data.tripout,
        "Ship Out": this.shipMap[item.data.shipout]?.name || 'N/A',
        "Diff": item.data.diff || '',
        "Wgross": item.data.wgross,
        "Wtare": item.data.wtare,
        "Wnet": item.data.wnet,
        "WTicket": item.data.wticket,
        "Img Scale": item.data.imgscale || '',
      }));
      // convertir a CSV
      const csv = this.convertToCSV(rows);
      // descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'replenishment_export.csv');
      link.click();
    } catch (err) {
      console.error('Error exportToExcel:', err);
    }
  }

  convertToCSV(data: any[]): string {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(field => `"${(row[field] ?? '').toString().replace(/"/g, '""')}"`).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('es-CO');
  }

  initCurrentMonthRange() {
    const today = new Date();
    const todayDayOfYear = this.getTodayDayOfYear();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDayOfYear = this.getDayOfYear(firstDayOfMonth);
    this.dayRange = {
      lower: startDayOfYear,
      upper: todayDayOfYear
    };
    this.syncDays();
  }

  getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  copyToClipboard(text: string | undefined) {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copiado:', text);
        this.utilService.presentToast("copied: "+text,"default",400)
      })
      .catch(err => {
        console.error('Error al copiar:', err);
      });
  }


}



