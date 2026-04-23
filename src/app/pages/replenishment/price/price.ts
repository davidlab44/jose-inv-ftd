import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Subject } from 'rxjs';
import { GlppricesService } from '../../../services/replenishment/glpprices.service';

@Component({
  selector: 'page-price',
  templateUrl: 'price.html',
  styleUrls: ['./price.scss'],
})
export class PricePage {

  importado: boolean = false;
  showSearchbar: boolean = false;
  selectedPrice: any = null;
  showEditForm: boolean = false;
  yearPrices: any[] = [];
  glppricesList: any[] = [];
  numero!: number;
  cents!: number;
  lastGlpprice: any = null;
  lastImportedPrice: any = null;
  searchSubject = new Subject<string>();
  dateTimeStart!: string;
  dateTimeEnd!: string;

  constructor(private glpricesService: GlppricesService) {}

  ngOnInit() {
    this.loadYearPrices();
    this.getAllPrices();
  }

  loadYearPrices() {
    this.glpricesService.getCurrentYearPrices().subscribe(results => {
      this.yearPrices = results || [];
      this.buildFullCalendarEvents();
    });
  }

  getAllPrices() {
    this.glpricesService.getAll().subscribe({
      next: (response) => {
        this.glppricesList = response.slice().reverse();
        this.getMaxIdItem(this.glppricesList);
        this.getMaxImportedItem(this.glppricesList);
      }
    });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: 'auto',
    eventDisplay: 'block',
    displayEventTime: false,
    eventClick: (info) => this.onEventClick(info)
  };

  buildFullCalendarEvents() {
    const productId = this.importado ? 2 : 1;
    const filtered = this.yearPrices.filter(p => p.data?.id_replenishment_product === productId);
    const events: any[] = [];
    for (const p of filtered) {
      const startDate = new Date(p.data.init);
      const endDate = new Date(p.data.end);
      let current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().substring(0, 10);
        events.push({
          title: `$${p.data.price}.${(p.data.cents ?? 0).toString().padStart(2, '0')}`,
          start: dateStr,
          allDay: true,
          display: 'block',
          backgroundColor: this.importado ? '#7b2cbf' : '#2e7d32',
          borderColor: this.importado ? '#7b2cbf' : '#2e7d32',
          extendedProps: { id: p.id, fullData: p.data }
        });
        current.setDate(current.getDate() + 1);
      }
    }
    this.calendarOptions = { ...this.calendarOptions, events };
  }

  onEventClick(info: any) {
    const data = info.event.extendedProps.fullData;
    this.selectedPrice = { id: info.event.extendedProps.id, price: data.price, cents: data.cents ?? 0, init: data.init, end: data.end };
    this.showEditForm = true;
  }

  updatePrice() {
    const updatedData = { price: this.selectedPrice.price, cents: this.selectedPrice.cents, init: this.selectedPrice.init, end: this.selectedPrice.end, currency: 57, id_replenishment_product: this.importado ? 2 : 1 };
    this.glpricesService.patch(this.selectedPrice.id, updatedData).subscribe(() => {
      this.showEditForm = false;
      this.selectedPrice = null;
      this.loadYearPrices();
      this.getAllPrices();
    });
  }

  cancelEdit() { this.showEditForm = false; this.selectedPrice = null; }

  addGlpprice(price: number, cents: number) {
    const productId = this.importado ? 2 : 1;
    this.glpricesService.addGlpprice(price, cents, this.dateTimeStart, this.dateTimeEnd, productId).subscribe(() => {
      this.loadYearPrices();
      this.getAllPrices();
    });
  }

  onSegmentChange(event: any) {
    this.importado = event.detail.value === 'favorites';
    this.buildFullCalendarEvents();
  }

  get currentPrice() { return this.importado ? this.lastImportedPrice : this.lastGlpprice; }

  get currentRangeLabel(): string {
    const init = this.currentPrice?.data?.init;
    const end = this.currentPrice?.data?.end;
    if (!init || !end) return '';
    return `${this.formatFechaLatam(init)} - ${this.formatFechaLatam(end)}`;
  }

  getMaxIdItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 1);
    if (!filtered.length) return;
    this.lastGlpprice = filtered.reduce((max, item) => item.id > max.id ? item : max);
  }

  getMaxImportedItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 2);
    if (!filtered.length) return;
    this.lastImportedPrice = filtered.reduce((max, item) => item.id > max.id ? item : max);
  }

  formatFechaLatam(dateInput: string | Date | number): string {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatCents(cents: number): string { return (cents ?? 0).toString().padStart(2, '0'); }

  onSearch(text: string) { this.searchSubject.next(text); }

  onDateTimeChange() { console.log(this.dateTimeStart, this.dateTimeEnd); }

}




/*import { FullCalendarComponent } from '@fullcalendar/angular';*/
/*import { ViewChild } from '@angular/core';*/
/*import { Component } from '@angular/core';*/
/*import { CalendarOptions } from '@fullcalendar/core';*/
/*import dayGridPlugin from '@fullcalendar/daygrid';*/
/*import { Subject } from 'rxjs';*/
/*import { GlppricesService } from '../../../services/replenishment/glpprices.service';*/

/*@Component({*/
  /*selector: 'page-price',*/
  /*templateUrl: 'price.html',*/
  /*styleUrls: ['./price.scss'],*/
/*})*/
/*export class PricePage {*/

/*@ViewChild('calendar') calendarComponent!: FullCalendarComponent;*/

  /*calendarApi: any;*/
  /*importado: boolean = false;*/
  /*showSearchbar: boolean = false;*/
  /*selectedPrice: any = null;*/
  /*showEditForm: boolean = false;*/
  /*yearPrices: any[] = [];*/
  /*glppricesList: any[] = [];*/
  /*numero!: number;*/
  /*cents!: number;*/
  /*lastGlpprice: any = null;*/
  /*lastImportedPrice: any = null;*/
  /*searchSubject = new Subject<string>();*/
  /*dateTimeStart!: string;*/
  /*dateTimeEnd!: string;*/
  /*handleCalendarInit(arg: any) {*/
    /*this.calendarApi = arg.view.calendar;*/
  /*}*/

  /*constructor(*/
    /*private glpricesService: GlppricesService*/
  /*) {}*/

  /*ngOnInit() {*/
    /*this.loadYearPrices();*/
    /*this.getAllPrices();*/
  /*}*/

  /*loadYearPrices() {*/
    /*this.glpricesService*/
      /*.getCurrentYearPrices()*/
      /*.subscribe(results => {*/
        /*this.yearPrices = results || [];*/
        /*this.buildFullCalendarEvents();*/
      /*});*/
  /*}*/

  /*getAllPrices() {*/
    /*this.glpricesService.getAll().subscribe({*/
      /*next: (response) => {*/
        /*this.glppricesList = response.slice().reverse();*/
        /*this.getMaxIdItem(this.glppricesList);*/
        /*this.getMaxImportedItem(this.glppricesList);*/
        /*console.log('response',response);*/
      /*}*/
    /*});*/
  /*}*/

  /*events: any[] = [];*/

  /*priceMap: Record<string, any> = {};*/

  /*calendarOptions: CalendarOptions = {*/
    /*initialView: 'dayGridMonth',*/
    /*plugins: [dayGridPlugin],*/
    /*height: 'auto',*/
    /*eventDisplay: 'block',*/
    /*displayEventTime: false,*/
    /*eventClick: (info) => this.onEventClick(info)*/
  /*};*/

  /*formatDateKey(date: Date): string {*/
    /*return date.getFullYear() + '-' +*/
      /*String(date.getMonth() + 1).padStart(2, '0') + '-' +*/
      /*String(date.getDate()).padStart(2, '0');*/
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
          /*title: `$${p.data.price}.${p.data.cents.toString().padStart(2, '0')}`,*/
          /*start: dateStr,*/
          /*allDay: true,*/
          /*display: 'block',*/
          /*backgroundColor: this.importado ? '#7b2cbf' : '#2e7d32',*/
          /*borderColor: this.importado ? '#7b2cbf' : '#2e7d32',*/
          /*extendedProps: {*/
            /*id: p.id,*/
            /*fullData: p.data*/
          /*}*/
        /*});*/
        /*current.setDate(current.getDate() + 1);*/
      /*}*/
    /*});*/
    /*this.calendarOptions = {*/
      /*...this.calendarOptions,*/
      /*events*/
    /*};*/
  /*}*/

  /*getPriceForDate(dateStr: string) {*/
    /*return this.priceMap[dateStr] || null;*/
  /*}*/

  /*onEventClick(info: any) {*/
    /*const data = info.event.extendedProps.fullData;*/
    /*this.selectedPrice = {*/
      /*id: info.event.extendedProps.id,*/
      /*price: data.price,*/
      /*cents: data.cents || 0,*/
      /*init: data.init,*/
      /*end: data.end*/
    /*};*/
    /*this.showEditForm = true;*/
  /*}*/

  /*updatePrice() {*/
    /*const updatedData = {*/
      /*price: this.selectedPrice.price,*/
      /*cents: this.selectedPrice.cents,*/
      /*init: this.selectedPrice.init,*/
      /*end: this.selectedPrice.end,*/
      /*currency: 57,*/
      /*id_replenishment_product: this.importado ? 2 : 1*/
    /*};*/
    /*this.glpricesService*/
      /*.patch(this.selectedPrice.id, updatedData)*/
      /*.subscribe(() => {*/
        /*this.showEditForm = false;*/
        /*this.selectedPrice = null;*/
        /*this.loadYearPrices();*/
        /*this.getAllPrices();*/
      /*});*/
  /*}*/

  /*cancelEdit() {*/
    /*this.showEditForm = false;*/
    /*this.selectedPrice = null;*/
  /*}*/

  /*addGlpprice(price: number, cents: number) {*/
    /*const productId = this.importado ? 2 : 1;*/
    /*this.glpricesService*/
      /*.addGlpprice(price, cents, this.dateTimeStart, this.dateTimeEnd, productId)*/
      /*.subscribe(() => {*/
        /*this.loadYearPrices();*/
        /*this.getAllPrices();*/
      /*});*/
  /*}*/

  /*onSegmentChange(event: any) {*/
    /*this.importado = event.detail.value === 'favorites';*/
    /*this.buildFullCalendarEvents();*/
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

  /*formatFechaLatam(dateInput: string | Date | number): string {*/
    /*if (!dateInput) return '';*/
    /*const date = new Date(dateInput);*/

    /*return date.toLocaleDateString('es-CO', {*/
      /*day: '2-digit',*/
      /*month: 'short',*/
      /*year: 'numeric'*/
    /*});*/
  /*}*/

  /*onSearch(text: string) {*/
    /*this.searchSubject.next(text);*/
  /*}*/

  /*onDateTimeChange() {*/
    /*console.log(this.dateTimeStart, this.dateTimeEnd);*/
  /*}*/


/*}*/


