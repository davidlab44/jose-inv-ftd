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
  glpAllocList: any[] = [];

  //numero!: number;
  //cents!: number;

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
        console.log("year alloc reservado",results)

      });
  }

  getAllPrices() {
    this.allocService.getAll().subscribe({
      next: (response) => {
        this.glpAllocList = response.slice().reverse();
        this.getMaxIdItem(this.glpAllocList);
        this.getMaxImportedItem(this.glpAllocList);
        console.log("get all allocs",response)
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
          title: new Intl.NumberFormat('es-CO').format(p.data.alloc),
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

  get currentAlloc() {
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
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate();
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  /*formatFechaLatam(dateInput: string | Date | number): string {*/
    /*if (!dateInput) return '';*/
    /*const date = new Date(dateInput);*/
    /*return date.toLocaleString('es-ES');*/
  /*}*/

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  onDateTimeChange() {
    console.log(this.dateTimeStart, this.dateTimeEnd);
  }


}


