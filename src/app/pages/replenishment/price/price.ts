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

  constructor(
    private glpricesService: GlppricesService
  ) {}

  ngOnInit() {
    this.loadYearPrices();
    this.getAllPrices();
  }

  loadYearPrices() {
    this.glpricesService
      .getCurrentYearPrices()
      .subscribe(results => {
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
        console.log('response',response);
      }
    });
  }

  events: any[] = [];

  priceMap: Record<string, any> = {}; // 🔥 lookup O(1)

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    timeZone: 'America/Bogota',
    height: 'auto',

    // 🔥 NO usamos events para pintar rangos
    events: [],

    dayCellDidMount: (info) => {

      const dateStr =
        info.date.getFullYear() + '-' +
        String(info.date.getMonth() + 1).padStart(2, '0') + '-' +
        String(info.date.getDate()).padStart(2, '0');

      const data = this.priceMap[dateStr];

      if (!data) return;

      // 🎨 pintar fondo
      info.el.style.backgroundColor =
        data.id_replenishment_product === 2 ? '#7b2cbf' : '#2e7d32';

      info.el.style.color = 'white';
      info.el.style.position = 'relative';

      // 🏷 label precio
      const label = document.createElement('div');
      label.innerText = `$${data.price}.${data.cents.toString().padStart(2, '0')}`;

      label.style.position = 'absolute';
      label.style.bottom = '2px';
      label.style.left = '2px';
      label.style.fontSize = '10px';
      label.style.fontWeight = 'bold';

      info.el.appendChild(label);
    }
  };

  buildFullCalendarEvents() {
    const productId = this.importado ? 2 : 1;
    console.log('==== BUILD PRICE MAP ====');
    const map: Record<string, any> = {};
    for (const p of this.yearPrices) {
      const d = p.data;

      if (!d || d.id_replenishment_product !== productId) continue;

      const start = new Date(d.init);
      const end = new Date(d.end);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('❌ fechas inválidas:', d);
        continue;
      }

      let current = new Date(start);

      while (current <= end) {

        const key =
          current.getFullYear() + '-' +
          String(current.getMonth() + 1).padStart(2, '0') + '-' +
          String(current.getDate()).padStart(2, '0');

        map[key] = d;

        current.setDate(current.getDate() + 1);
      }

      console.log(`✔ rango cargado: ${d.init} → ${d.end}`);
    }

    this.priceMap = map;

    console.log('==== MAP SIZE ====', Object.keys(this.priceMap).length);
  }

  getPriceForDate(dateStr: string) {
    return this.priceMap[dateStr] || null;
  }

  onEventClick(info: any) {
    const data = info.event.extendedProps.fullData;
    this.selectedPrice = {
      id: info.event.extendedProps.id,
      price: data.price,
      cents: data.cents.toString() || 0,
      init: data.init,
      end: data.end
    };
    this.showEditForm = true;
  }

  updatePrice() {
    const updatedData = {
      price: this.selectedPrice.price,
      cents: this.selectedPrice.cents,
      init: this.selectedPrice.init,
      end: this.selectedPrice.end,
      currency: 57,
      id_replenishment_product: this.importado ? 2 : 1
    };
    this.glpricesService
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

  addGlpprice(price: number, cents: number) {
    const productId = this.importado ? 2 : 1;
    this.glpricesService
      .addGlpprice(price, cents, this.dateTimeStart, this.dateTimeEnd, productId)
      .subscribe(() => {
        this.loadYearPrices();
        this.getAllPrices();
      });
  }

  onSegmentChange(event: any) {
    this.importado = event.detail.value === 'favorites';
    this.buildFullCalendarEvents();
  }

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



