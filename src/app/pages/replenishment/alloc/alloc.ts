import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Subject } from 'rxjs';
import { AllocService } from '../../../services/replenishment/alloc.service';

@Component({
  selector: 'page-alloc',
  templateUrl: 'alloc.html',
  styleUrls: ['./alloc.scss'],
})
export class AllocPage {

  /* ================= CALENDAR ================= */

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: 'auto',
    eventDisplay: 'block',
    displayEventTime: false,
    eventClick: (info) => this.onEventClick(info)
  };

  /* ================= UI STATE ================= */

  importado: boolean = false;
  showSearchbar: boolean = false;

  selectedPrice: any = null;
  showEditForm: boolean = false;

  /* ================= DATA ================= */

  yearPrices: any[] = [];
  glppricesList: any[] = [];

  numero!: number;
  cents!: number;

  lastGlpprice: any = null;
  lastImportedPrice: any = null;

  searchSubject = new Subject<string>();

  dateTimeStart!: string;
  dateTimeEnd!: string;

  constructor(
    private allocService: AllocService
  ) {}

  /* ================= INIT ================= */

  ngOnInit() {
    this.loadYearPrices();
    this.getAllPrices();
  }

  /* ================= LOAD ================= */

  loadYearPrices() {
    this.allocService
      .getCurrentYearPrices()
      .subscribe(results => {
        this.yearPrices = results || [];
        this.buildFullCalendarEvents();
      });
  }

  getAllPrices() {
    this.allocService.getAll().subscribe({
      next: (response) => {
        this.glppricesList = response.slice().reverse();
        this.getMaxIdItem(this.glppricesList);
        this.getMaxImportedItem(this.glppricesList);
      }
    });
  }

  /* ================= BUILD EVENTS ================= */

  buildFullCalendarEvents() {

    const productId = this.importado ? 2 : 1;

    const filtered = this.yearPrices
      .filter(p => p.data?.id_replenishment_product === productId);

    const events: any[] = [];

    filtered.forEach(p => {

      const startDate = new Date(p.data.init);
      const endDate   = new Date(p.data.end);

      let current = new Date(startDate);

      while (current <= endDate) {

        const dateStr = current.toISOString().substring(0, 10);

        events.push({
          title: `$${p.data.price}`,
          start: dateStr,
          allDay: true,
          display: 'block',
          backgroundColor: this.importado ? '#7b2cbf' : '#2e7d32',
          borderColor: this.importado ? '#7b2cbf' : '#2e7d32',
          extendedProps: {
            id: p.id,
            fullData: p.data
          }
        });

        current.setDate(current.getDate() + 1);
      }
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events
    };
  }

  /* ================= CLICK EVENT ================= */

  onEventClick(info: any) {

    const data = info.event.extendedProps.fullData;

    this.selectedPrice = {
      id: info.event.extendedProps.id,
      price: data.price,
      cents: data.cents || 0,
      init: data.init,
      end: data.end
    };

    this.showEditForm = true;
  }

  /* ================= PATCH ================= */

  updatePrice() {

    const updatedData = {
      price: this.selectedPrice.price,
      cents: this.selectedPrice.cents,
      init: this.selectedPrice.init,
      end: this.selectedPrice.end,
      currency: 57,
      id_replenishment_product: this.importado ? 2 : 1
    };

    this.allocService
      .patch(this.selectedPrice.id, updatedData)
      .subscribe(() => {
        this.showEditForm = false;
        this.selectedPrice = null;
        this.loadYearPrices();
        this.getAllPrices();
      });
  }

  cancelEdit() {
    this.showEditForm = false;
    this.selectedPrice = null;
  }

  /* ================= ADD PRICE ================= */

  addGlpprice(price: number, cents: number) {

    const productId = this.importado ? 2 : 1;

    this.allocService
      .addGlpprice(price, cents, this.dateTimeStart, this.dateTimeEnd, productId)
      .subscribe(() => {
        this.loadYearPrices();
        this.getAllPrices();
      });
  }

  /* ================= SEGMENT ================= */

  onSegmentChange(event: any) {
    this.importado = event.detail.value === 'favorites';
    this.buildFullCalendarEvents();
  }

  /* ================= HELPERS ================= */

  get currentPrice() {
    return this.importado ? this.lastImportedPrice : this.lastGlpprice;
  }

  getMaxIdItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 1);
    if (!filtered.length) return;
    this.lastGlpprice = filtered.reduce((max, item) =>
      item.id > max.id ? item : max
    );
  }

  getMaxImportedItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 2);
    if (!filtered.length) return;
    this.lastImportedPrice = filtered.reduce((max, item) =>
      item.id > max.id ? item : max
    );
  }

  formatFechaLatam(dateInput: string | Date | number): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return date.toLocaleString('es-ES');
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  onDateTimeChange() {
    console.log(this.dateTimeStart, this.dateTimeEnd);
  }

}




















































/*export class PricePage {*/

  /*calendarOptions: CalendarOptions = {*/
    /*initialView: 'dayGridMonth',*/
    /*plugins: [dayGridPlugin],*/
    /*height: 'auto',*/
    /*eventDisplay: 'block',*/
    /*displayEventTime: false,*/
    /*eventClick: (info) => {*/
      /*this.onEventClick(info);*/
    /*}*/
  /*};*/
  
  /*selectedPrice: any = null;*/
  /*showEditForm = false;*/

  /*onEventClick(info: any) {*/

    /*const priceData = info.event.extendedProps.fullData;*/

    /*this.selectedPrice = {*/
      /*id: info.event.extendedProps.id,*/
      /*price: priceData.price,*/
      /*cents: priceData.cents,*/
      /*init: priceData.init,*/
      /*end: priceData.end*/
    /*};*/

    /*this.showEditForm = true;*/

    /*console.log("Evento seleccionado:", this.selectedPrice);*/
  /*}*/

  /*ios: boolean;*/
  /*importado: boolean = false;*/
  /*hasOwner: boolean = false;*/
  /*showSearchbar: boolean;*/
  /*queryText: any;*/
  /*searchSubject = new Subject<string>();*/
  /*todayDate: any;*/

  /*hash: string = '';*/
  /*table: any;*/
  /*rexDocument: any;*/
  /*glppricesList: any[] = [];*/

  /*yearPrices: any[] = [];*/
  /*occupiedDatesSet: Set<string> = new Set();*/

  /*dateTimeStart!: string;*/
  /*dateTimeEnd!: string;*/

  /*numero!: number;*/
  /*cents!: number;*/
  /*valor: number = 0;*/

  /*lastGlpprice: any = null;*/
  /*lastImportedPrice: any = null;*/

  /*constructor(*/
    /*private barcodeService: BarcodeService,*/
    /*public alertCtrl: AlertController,*/
    /*public confData: ConferenceData,*/
    /*public loadingCtrl: LoadingController,*/
    /*public modalCtrl: ModalController,*/
    /*public router: Router,*/
    /*public toastCtrl: ToastController,*/
    /*public user: UserData,*/
    /*public config: Config,*/
    /*private opportunityService: OpportunityService,*/
    /*private posOrderService: PosOrderService,*/
    /*private tableService: TableService,*/
    /*private route: ActivatedRoute,*/
    /*private sessionService: SessionService,*/
    /*private utilService: UtilService,*/
    /*private productService: ProductService,*/
    /*private categoryService: CategoryService,*/
    /*private umService: UmService,*/
    /*private dateService: DateService,*/
    /*private rexService: RexService,*/
    /*private prodrexService: ProdrexService,*/
    /*private userService: UserService,*/
    /*private glpricesService: GlppricesService*/
  /*) {}*/


  /*async ngOnInit() {*/

    /*const ahora = new Date();*/
    /*this.todayDate = this.formatFechaLatam(ahora);*/
    /*this.getAllPrices();*/
    /*const now = new Date();*/
    /*const startOfDay = new Date(*/
      /*now.getFullYear(),*/
      /*now.getMonth(),*/
      /*now.getDate(),*/
      /*0, 0, 0*/
    /*);*/
    /*const endOfDay = new Date(*/
      /*now.getFullYear(),*/
      /*now.getMonth(),*/
      /*now.getDate(),*/
      /*23, 59, 0*/
    /*);*/
    /*this.dateTimeStart = this.toLocalDateTime(startOfDay);*/
    /*this.dateTimeEnd = this.toLocalDateTime(endOfDay);*/
    /*this.loadYearPrices(); */
  /*}*/

  /*highlightedDates = (isoString: string) => {*/
    /*const date = isoString.substring(0, 10);*/
    /*if (this.occupiedDatesSet.has(date)) {*/
      /*return {*/
        /*textColor: '#ffffff',*/
        /*backgroundColor: this.importado ? '#7b2cbf' : '#2e7d32'*/
      /*};*/
    /*}*/
    /*return undefined;*/
  /*};*/

  /*loadYearPrices() {*/
    /*this.glpricesService*/
      /*.getCurrentYearPrices()*/
      /*.subscribe(results => {*/
        /*console.log("RESULTS FROM BACKEND:", results);*/
        /*this.yearPrices = results || [];*/
        /*//this.buildCalendar();*/
        /*this.buildFullCalendarEvents();*/
      /*});*/
  /*}*/

  /*calendarReady = false;*/
  /*buildCalendar() {*/
    /*const productId = this.importado ? 2 : 1;*/
    /*const filtered = this.yearPrices*/
      /*.filter(p => p.data?.id_replenishment_product === productId);*/
    /*this.occupiedDatesSet.clear();*/
    /*filtered.forEach(p => {*/
      /*const initDate = new Date(p.data.init);*/
      /*const endDate  = new Date(p.data.end);*/
      /*let current = new Date(initDate);*/
      /*while (current <= endDate) {*/
        /*const year  = current.getFullYear();*/
        /*const month = String(current.getMonth() + 1).padStart(2, '0');*/
        /*const day   = String(current.getDate()).padStart(2, '0');*/
        /*const dateOnly = `${year}-${month}-${day}`;*/
        /*this.occupiedDatesSet.add(dateOnly);*/
        /*current.setDate(current.getDate() + 1);*/
      /*}*/
    /*});*/
    /*this.calendarReady = false;*/
    /*setTimeout(() => {*/
      /*this.calendarReady = true;*/
    /*}, 0);*/
  /*}*/

  /*onSegmentChange(event: any) {*/
    /*this.importado = event.detail.value === 'favorites';*/
    /*this.buildFullCalendarEvents();*/
  /*}*/

  /*getAllPrices() {*/
    /*this.glpricesService.getAll().subscribe({*/
      /*next: (response) => {*/
        /*this.glppricesList = response.slice().reverse();*/
        /*this.getMaxIdItem(this.glppricesList);*/
        /*this.getMaxImportedItem(this.glppricesList);*/
      /*}*/
    /*});*/
  /*}*/

  /*addGlpprice(price: number, cents: number) {*/
    /*const productId = this.importado ? 2 : 1;*/
    /*const newStart = new Date(this.dateTimeStart);*/
    /*const newEnd   = new Date(this.dateTimeEnd);*/
    /*const overlap = this.hasOverlap(productId, newStart, newEnd);*/
    /*if (overlap) {*/
      /*alert("⚠ Ya existe un rango que se solapa con este.");*/
      /*return;*/
    /*}*/
    /*this.glpricesService*/
      /*.addGlpprice(price, cents, this.dateTimeStart, this.dateTimeEnd, productId)*/
      /*.subscribe(() => {*/
        /*this.getAllPrices();*/
        /*this.loadYearPrices();*/
      /*});*/
  /*}*/

  /*get currentPrice() {*/
    /*return this.importado ? this.lastImportedPrice : this.lastGlpprice;*/
  /*}*/

  /*getMaxIdItem(items: any[]) {*/
    /*const filtered = items.filter(i => i.data?.id_replenishment_product === 1);*/
    /*if (!filtered.length) return;*/
    /*this.lastGlpprice = filtered.reduce((max, item) =>*/
      /*item.id > max.id ? item : max*/
    /*);*/
  /*}*/

  /*getMaxImportedItem(items: any[]) {*/
    /*const filtered = items.filter(i => i.data?.id_replenishment_product === 2);*/
    /*if (!filtered.length) return;*/
    /*this.lastImportedPrice = filtered.reduce((max, item) =>*/
      /*item.id > max.id ? item : max*/
    /*);*/
  /*}*/

  /*toLocalDateTime(date: Date): string {*/
    /*const pad = (n: number) => n.toString().padStart(2, '0');*/
    /*return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +*/
      /*`${pad(date.getHours())}:${pad(date.getMinutes())}:00`;*/
  /*}*/

  /*formatForBackend(value: string): string {*/
    /*const d = new Date(value);*/
    /*const pad = (n: number) => n.toString().padStart(2, '0');*/
    /*return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +*/
      /*`${pad(d.getHours())}:${pad(d.getMinutes())}:00`;*/
  /*}*/

  /*formatFechaLatam(dateInput: string | Date | number): string {*/
    /*if (!dateInput) return '';*/
    /*const date = new Date(dateInput);*/
    /*const opciones: Intl.DateTimeFormatOptions = {*/
      /*day: '2-digit',*/
      /*month: 'long',*/
      /*year: 'numeric'*/
    /*};*/
    /*const fechaTexto = new Intl.DateTimeFormat('es-ES', opciones).format(date);*/
    /*let horas = date.getHours();*/
    /*const minutos = String(date.getMinutes()).padStart(2, '0');*/
    /*const segundos = String(date.getSeconds()).padStart(2, '0');*/
    /*const ampm = horas >= 12 ? 'PM' : 'AM';*/
    /*horas = horas % 12;*/
    /*if (horas === 0) horas = 12;*/
    /*const horasTexto = String(horas).padStart(2, '0');*/
    /*return `${fechaTexto} ${horasTexto}:${minutos}:${segundos} ${ampm}`;*/
  /*}*/

  /*onSearch(text: string) {*/
    /*this.searchSubject.next(text);*/
  /*}*/

  /*onDateTimeChange() {*/
    /*const payload = {*/
      /*start_datetime: this.formatForBackend(this.dateTimeStart),*/
      /*end_datetime: this.formatForBackend(this.dateTimeEnd)*/
    /*};*/
    /*console.log('Inicio (raw):', this.dateTimeStart);*/
    /*console.log('Fin (raw):', this.dateTimeEnd);*/
    /*console.log('Payload backend:', payload);*/
  /*}*/

  /*hasOverlap(*/
    /*productId: number,*/
    /*newStart: Date,*/
    /*newEnd: Date*/
  /*): boolean {*/

    /*const filtered = this.yearPrices*/
      /*.filter(p => p.data?.id_replenishment_product === productId);*/

    /*for (const p of filtered) {*/

      /*const existingStart = new Date(p.data.init);*/
      /*const existingEnd   = new Date(p.data.end);*/

      /*const overlap =*/
        /*newStart <= existingEnd &&*/
        /*newEnd   >= existingStart;*/

      /*if (overlap) {*/
        /*console.log("Overlap detectado con ID:", p.id);*/
        /*return true;*/
      /*}*/
    /*}*/

    /*return false;*/
  /*}*/



  /*buildFullCalendarEvents() {*/
    /*const productId = this.importado ? 2 : 1;*/
    /*const filtered = this.yearPrices*/
      /*.filter(p => p.data?.id_replenishment_product === productId);*/
    /*const events: any[] = [];*/
    /*filtered.forEach(p => {*/
      /*const startDate = new Date(p.data.init);*/
      /*const endDate   = new Date(p.data.end);*/
      /*let current = new Date(startDate);*/
      /*while (current <= endDate) {*/
        /*const dateStr = current.toISOString().substring(0, 10);*/
        /*events.push({*/
          /*title: `$${p.data.price}`,*/
          /*start: dateStr,*/
          /*allDay: true,*/
          /*display: 'block',*/
          /*backgroundColor: this.importado ? '#7b2cbf' : '#2e7d32',*/
          /*borderColor: this.importado ? '#7b2cbf' : '#2e7d32'*/
        /*});*/

        /*current.setDate(current.getDate() + 1);*/
      /*}*/
    /*});*/
    /*this.calendarOptions = {*/
      /*...this.calendarOptions,*/
      /*events: events*/
    /*};*/
  /*}*/


/*}*/




