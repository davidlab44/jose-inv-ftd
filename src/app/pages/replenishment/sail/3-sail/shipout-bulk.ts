import { Component, ViewChild, OnInit } from '@angular/core';
import { Location } from '@angular/common'; 
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Ship,ShipMap } from '../../../../interfaces/ship';
import { UtilService } from '../../../../services/util.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { CcoService } from '../../../../services/cc/cco.service';
import { ShipService } from '../../../../services/logistic/ship.service';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector:'app-shipout-bulk',
  templateUrl:'./shipout-bulk.html',
  styleUrls:['./shipout-bulk.scss'],
})

export class ShipoutBulkPage implements OnInit {
  @ViewChild(IonList,{ static:false }) ionList!:IonList;
  withdrawnList:any[]=[];
  fullWithdrawnList:any[]=[];
  filteredList:any[]=[];
  private processingVersion = 0;
  selectedIds = new Set<number>();
  selectedShipId: number | null = null;
  shipModalOpen = false;
  savingShipout = false;
  loadingMovements = false;
  get selectedCount(): number { return this.selectedIds.size; }
  get visibleSelectedCount(): number { return this.filteredList.filter(r => !r.isGhost && this.selectedIds.has(Number(r.id))).length; }
  get visiblePendingCount(): number { return this.filteredList.filter(r => !r.isGhost).length; }
  isSelected(id: number): boolean { return this.selectedIds.has(Number(id)); }
  onSelectRow(id: number, checked: boolean): void {
    const key = Number(id);
    if (!this.withdrawnList.some(row => Number(row.id) === key)) return;
    if (checked) this.selectedIds.add(key);
    else this.selectedIds.delete(key);
  }
  selectVisible(checked: boolean): void {
    for (const row of this.filteredList) {
      if (row.isGhost) continue;
      const id = Number(row.id);
      if (checked) this.selectedIds.add(id);
      else this.selectedIds.delete(id);
    }
  }
  clearSelection(): void { this.selectedIds.clear(); }
  openShipModal(): void {
    if (!this.selectedCount || this.savingShipout) return;
    if (!this.shipList.length) this.loadShips();
    this.shipModalOpen = true;
  }
  closeShipModal(): void {
    if (!this.savingShipout) this.shipModalOpen = false;
  }
  async saveShipout(): Promise<void> {
    const shipId = Number(this.selectedShipId);
    if (!Number.isInteger(shipId) || shipId <= 0 || shipId === 3 || !this.shipList.some(s => Number(s.id) === shipId)) {
      await this.showShipoutToast('Selecciona un barco válido (distinto de 3).', 'warning');
      return;
    }
    const pendingIds = new Set(this.withdrawnList.map(row => Number(row.id)));
    const ids = [...this.selectedIds].filter(id => pendingIds.has(id));
    if (!ids.length || this.savingShipout) return;
    this.savingShipout = true;
    this.withdrawnService.updateShipout(ids, shipId).subscribe({
      next: async (updated: any[]) => {
        this.savingShipout = false;
        const changed = Array.isArray(updated) ? updated.map(x => Number(x.id)) : [];
        for (const id of changed) this.selectedIds.delete(id);
        this.shipModalOpen = false;
        this.selectedShipId = null;
        await this.showShipoutToast(`${changed.length} registro(s) actualizados.`, 'success');
        this.getAll();
      },

      error: async (err: any) => {
        this.savingShipout = false;
        console.error('Error actualizando shipout en bloque:', err);
        await this.showShipoutToast('No se pudo guardar. La selección se conserva para reintentar.', 'danger');
      }
    });
  }
  private async showShipoutToast(message: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({message, color, duration: 2500, position: 'bottom'});
    await toast.present();
  }

  ccoMap:CcoMap={};
  ccoList:any[]=[];
  shipList:Ship[]=[];
  shipMap:ShipMap={};
  dayRange={
    lower:1,
    upper:this.getTodayDayOfYear()
  };
  startDay=1;
  endDay=this.dayRange.upper;
  types=[
    { value:1,name:'Nacional' },
    { value:2,name:'Importado' }
  ];
  vendors=[
    { value:1,name:'Plexa' },
    { value:2,name:'Plexa port' }
  ];
  filterType:number=this.types[0].value;
  filterVendor:number=this.vendors[0].value;
  valor1=0;
  valor2=0;
  valor3=0;
  valor4=0;
  totalKg=0;
  totalGlpOpc=0;
  totalGlpImportado=0;
  ios:boolean;
  showSearchbar:boolean;
  searchSubject=new Subject<string>();
  private searchSubscription?: Subscription;
  searchTerm:string='';
  sortColumn:string='';
  sortDirection:'asc'|'desc'='asc';
  private rangeTimeout:any;

  constructor(
    private barcodeService:BarcodeService,
    public alertCtrl:AlertController,
    public confData:ConferenceData,
    public loadingCtrl:LoadingController,
    public modalCtrl:ModalController,
    public router:Router,
    public toastCtrl:ToastController,
    public user:UserData,
    public config:Config,
    private utilService:UtilService,
    private withdrawnService:WithdrawnService,
    private ccoService:CcoService,
    private shipService:ShipService,
    private menu: MenuController,
    private location: Location
  ) {}

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
    clearTimeout(this.rangeTimeout);
  }
  ionViewWillLeave() {
      this.menu.enable(true);
  }

  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(term => {
      this.searchTerm = term.trim();
      this.refreshFilteredList();
    });
    this.initCurrentMonthRange();
    this.loadShips();
    this.loadCco();
  }
  ionViewWillEnter() {
    this.menu.enable(false);
    this.getAll();
  }
  // Componer el nombre visible usando data.name (ID de CCO).
  loadCco() {
    this.ccoService.getAll().subscribe({
      next: (ccos: any[]) => {
        this.ccoList = ccos || [];
        const map: any = {};
        for (const cco of this.ccoList) {
          const id = Number(cco?.data?.id ?? cco?.id);
          if (!Number.isFinite(id)) continue;
          map[id] = {
            name: String(cco?.data?.name ?? 'N/A'),
            color: cco?.data?.color ?? '#eee'
          };
        }
        this.ccoMap = map as CcoMap;
        this.refreshFilteredList();
      },
      error: err => console.error('Error loading CCO', err)
    });
  }
  loadShips() {
    this.shipService.getAll().subscribe({
      next:(ships)=>{
        this.shipList=ships;

        this.shipMap=this.buildShipMap(ships);
        this.updateShipNames();
      },
      error:(err)=>console.error(err)
    });
  }

  // Publicar los registros inmediatamente; enriquecerlos por lotes sin bloquear la UI.
  getAll() {
    const version = ++this.processingVersion;
    this.loadingMovements = true;
    // Consultar exclusivamente el intervalo seleccionado sobre created_at.
    const since = this.dayOfYearToISO(this.startDay);
    const until = this.dayOfYearToISO(this.endDay, true);
    this.withdrawnService.getIntervalByCreatedAt(since, until).subscribe({
      next: (response: any[]) => {
        if (version !== this.processingVersion) return;
        this.loadingMovements = false;
        const allRows = Array.isArray(response) ? response : [];
        // Pendiente: shipout NO es un entero positivo. Un entero positivo es un registro ghost.
        this.withdrawnList = allRows.filter(item => !this.hasAssignedShipout(item));
        const validIds = new Set(this.withdrawnList.map(item => Number(item.id)));
        for (const id of [...this.selectedIds]) if (!validIds.has(id)) this.selectedIds.delete(id);
        for (const item of this.withdrawnList) {
          if (!item.data) item.data = {};
          item.level = '';
        }
        this.fullWithdrawnList = this.buildMovementList(allRows);
        this.refreshFilteredList();
        // Permite pintar primero IDs y valores originales.
        setTimeout(() => this.enrichInBatches(version, 0), 0);
      },
      error: err => { this.loadingMovements = false; console.error('Error loading withdrawn records', err); }
    });
  }

  private enrichInBatches(version: number, offset: number): void {
    if (version !== this.processingVersion) return;
    const batchSize = 100;
    const end = Math.min(offset + batchSize, this.withdrawnList.length);
    // Calcular niveles por lotes, sin crear copias de todos los objetos.
    for (let i = offset; i < end; i++) {
      const item = this.withdrawnList[i];
      item.level = this.getLevel(item);
      const data = item.data;
      data.shipoutName = this.shipMap[data.shipout]?.name ?? '';
      data.shipinName = this.shipMap[data.shipin]?.name ?? '';
    }
    if (end < this.withdrawnList.length) {
      setTimeout(() => this.enrichInBatches(version, end), 0);
    } else {
      this.prepareWithdrawnList(this.withdrawnList);
      this.refreshFilteredList();
    }
  }

  private updateShipNames(): void {
    for (const item of this.withdrawnList) {
      if (!item.data) continue;
      item.data.shipoutName = this.shipMap[item.data.shipout]?.name ?? '';
      item.data.shipinName = this.shipMap[item.data.shipin]?.name ?? '';
    }
  }

  private prepareWithdrawnList(withdrawnList: any[]): void {
    let total = 0;
    let totalOpc = 0;
    let totalImportado = 0;
    const map = new Map<string, any>();
    for (const item of withdrawnList) {
      if (!item.data)
        item.data = {};
      const data = item.data;
      data.diff = 0;
      const kg = Number(data.kg) || 0;
      total += kg;
      if (data.id_replenishment_product === 1)
        totalOpc += kg;
      else if (data.id_replenishment_product === 2)
        totalImportado += kg;
      const wticket = data.wticket;
      if (
        wticket !== undefined &&
        Number(data.wnet) > 0 &&
        Number(data.wgross) > 0 &&
        Number(data.wtare) > 0
      ) {
        const key = String(wticket);
        if (map.has(key)) {
          const other = map.get(key);
          const match =
            Number(other.data.wnet) === Number(data.wnet) &&
            Number(other.data.wgross) === Number(data.wgross) &&
            Number(other.data.wtare) === Number(data.wtare);
          if (match) {
            const diff =
              (Number(other.data.kg) || 0) +
              (Number(data.kg) || 0) -
              Number(data.wnet);
            other.data.diff = diff;
            data.diff = diff;
          }
        } else {
          map.set(key, item);
        }
      }
      data.shipoutName = this.shipMap[data.shipout]?.name ?? '';
      data.shipinName = this.shipMap[data.shipin]?.name ?? '';
    }
    this.totalKg = total;
    this.totalGlpOpc = totalOpc;
    this.totalGlpImportado = totalImportado;
  }


  // Sólo enteros positivos (numéricos o cadenas enteras) representan una asignación.
  private hasAssignedShipout(row: any): boolean {
    const raw = row?.data?.shipout;
    if (raw === null || raw === undefined || typeof raw === 'boolean') return false;
    if (typeof raw === 'string' && !/^\d+$/.test(raw.trim())) return false;
    const value = Number(raw);
    return Number.isSafeInteger(value) && value > 0;
  }

  // Cada pendiente aparece una sola vez; su pareja asignada aparece sólo como ghost.
  // Los grupos se ordenan por el ID mayor de sus integrantes, descendente.
  private buildMovementList(allRows: any[]): any[] {
    const byId = new Map<number, any>(allRows.map(row => [Number(row.id), row]));
    const pending = allRows.filter(row => !this.hasAssignedShipout(row));
    const visited = new Set<number>();
    const groups: any[][] = [];
    for (const row of [...pending].sort((a, b) => Number(b.id) - Number(a.id))) {
      const id = Number(row.id);
      if (visited.has(id)) continue;
      const group = [row];
      visited.add(id);
      const twinId = Number(row.data?.twin);
      const twin = twinId > 0 && twinId !== id ? byId.get(twinId) : undefined;
      if (twin && !visited.has(Number(twin.id))) {
        group.push(twin);
        visited.add(Number(twin.id));
      }
      group.sort((a, b) => Number(b.id) - Number(a.id));
      groups.push(group);
    }
    groups.sort((a, b) => Math.max(...b.map(r => Number(r.id))) - Math.max(...a.map(r => Number(r.id))));
    const result: any[] = [];
    for (const group of groups) {
      group.forEach((row, index) => {
        row.isGhost = this.hasAssignedShipout(row);
        row.showSeparator = index === group.length - 1;
        result.push(row);
      });
    }
    return result;
  }

  trackByGroup(index:number,group:any):string {
    return group.refdate+'-'+index;
  }
  onRangeChange(event:any) {
    this.startDay=event.detail.value.lower;
    this.endDay=event.detail.value.upper;
    this.updateRangeAndFetch();
  }
  syncDays() {
    this.startDay=this.dayRange.lower;
    this.endDay=this.dayRange.upper;
  }
  formatDay(day:number):string {
    const base=new Date(new Date().getFullYear(), 0, 1);
    base.setDate(base.getDate()+(day-1));
    return base.toLocaleDateString('es-ES',{
      day:'2-digit',
      month:'short'
    });
  }
  daysInCurrentYear(): number {
    const year = new Date().getFullYear();
    return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
  }
  getTodayDayOfYear():number {
    const today=new Date();
    const start=new Date(today.getFullYear(),0,0);
    const diff=today.getTime()-start.getTime()+
      (
        start.getTimezoneOffset()-today.getTimezoneOffset()
      )*60*1000;
    return Math.floor(
      diff/
      (
        1000*
        60*
        60*
        24
      )
    );
  }
  // ISO UTC completo: conserva la conversión correcta desde la zona horaria local.
  // El límite final es exclusivo: medianoche del día siguiente.
  dayOfYearToISO(day:number,endOfDay=false):string {
    const year = new Date().getFullYear();
    const date = new Date(year, 0, day + (endOfDay ? 1 : 0));
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }
  calcularResultado():number {
    return (this.valor1||0)*(this.valor2||0);
  }
  calcularResultadoImportado():number {
    return (this.valor3||0)*(this.valor4||0);
  }
  setValor(valor:number) {
    this.valor1=valor;
  }
  onTypeChange(event:any) {
    this.filterType=event?.detail?.value??this.filterType;
  }
  onVendorChange(event:any) {
    this.filterVendor=event?.detail?.value??this.filterVendor;
  }
  onSearch(text:string) {
    this.searchSubject.next(String(text ?? ''));
  }
  formatFechaLatam(dateInput:string|Date|number):string {
    if(!dateInput)
      return '';
    const date=new Date(dateInput);
    const fechaTexto=new Intl.DateTimeFormat('es-ES',{
      day:'2-digit',
      month:'long',
      year:'numeric'
    }).format(date);
    let horas=date.getHours();
    const minutos=String(date.getMinutes()).padStart(2,'0');
    const segundos=String(date.getSeconds()).padStart(2,'0');
    const ampm=horas>=12?'PM':'AM';
    horas=horas%12;
    if(horas===0)
      horas=12;
    return fechaTexto + " " + String(horas).padStart(2, '0') + ":" + minutos + ":" + segundos + " " + ampm;
  }
  trackById(index:number,item:any):number {
    return item.id;
  }
  sortData(column:string) {
    // Mantener parejas juntas: se ordenan grupos, nunca filas individuales.
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else { this.sortColumn = column; this.sortDirection = 'asc'; }
    const groups: any[][] = [];
    let group: any[] = [];
    for (const row of this.fullWithdrawnList) {
      group.push(row);
      if (row.showSeparator) { groups.push(group); group = []; }
    }
    if (group.length) groups.push(group);
    groups.sort((a, b) => {
      const valA = this.getValue(a.find(r => !r.isGhost) ?? a[0], column);
      const valB = this.getValue(b.find(r => !r.isGhost) ?? b[0], column);
      const cmp = valA == null ? (valB == null ? 0 : -1) : valB == null ? 1 : valA < valB ? -1 : valA > valB ? 1 : 0;
      return cmp === 0 ? Number(b[0].id) - Number(a[0].id) : (this.sortDirection === 'asc' ? cmp : -cmp);
    });
    //this.fullWithdrawnList = groups.flat();
    this.fullWithdrawnList = groups.reduce(
      (acc: any[], group: any[]) => acc.concat(group),
      []
    );
    this.refreshFilteredList();
  }
  // Cachear el resultado: no reconstruir Maps/Sets en cada detección de cambios.
  private refreshFilteredList(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) { this.filteredList = [...this.fullWithdrawnList]; return; }
    const groups: any[][] = [];
    let group: any[] = [];
    for (const row of this.fullWithdrawnList) {
      group.push(row);
      if (row.showSeparator) { groups.push(group); group = []; }
    }
    if (group.length) groups.push(group);
    this.filteredList = groups.filter(rows => rows.some(row => {
      const name = this.ccoMap[Number(row.data?.name)]?.name ?? '';
      return [name, row.data?.name, row.id, row.data?.wticket].some(value => String(value ?? '').toLowerCase().includes(term));
    })).reduce(
      (acc: any[], group: any[]) => acc.concat(group),
      []
    );
    //})).flat();
  }

  // Sólo oculta cero numérico/textual y N/A; preserva IDs y demás datos.
  displayCell(value: any): any {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' && value === 0) return '';
    if (typeof value === 'string' && (value.trim() === '0' || value.trim().toUpperCase() === 'N/A')) return '';
    return value;
  }

  getValue(item:any,column:string) {
    return column.includes('data.')
      ?column.split('.').reduce((o,i)=>o?.[i],item)
      :item[column];
  }
  private buildShipMap(shipList:Ship[]):ShipMap {
    return shipList.reduce((acc,ship)=>{
      acc[ship.id]={
        name:ship.data?.name??'N/A',
        imo:ship.data?.imo??'N/A'
      };
      return acc;
    },{} as ShipMap);
  }
  toggleState(item:any,ev:any) {
    console.log('item',item);
    const checked=ev.detail.checked;
    item.state=checked?'erp':'pending';
    console.log('STATE =>',item.state,item);
    this.withdrawnService.updateWithdrawnState(item.id,item.state).subscribe({
      next:response=>{
        console.log('Response from server:',response);
      },
      error:err=>{
        console.error('Error updating state:',err);
      }
    });
  }
  changeStartDay(delta:number) {
    this.startDay=Math.max(1,Math.min(this.daysInCurrentYear(),this.startDay+delta));
    if(this.startDay>this.endDay)
      this.startDay=this.endDay;
    this.updateRangeAndFetch();
  }
  changeEndDay(delta:number) {
    this.endDay=Math.max(1,Math.min(this.daysInCurrentYear(),this.endDay+delta));
    if(this.endDay<this.startDay)
      this.endDay=this.startDay;
    this.updateRangeAndFetch();
  }
  updateRangeAndFetch() {
    this.dayRange={
      lower:this.startDay,
      upper:this.endDay
    };
    clearTimeout(this.rangeTimeout);
    this.rangeTimeout=setTimeout(()=>{
      this.getAll();
    },1000);
  }
  quickRange(ev:any) {
    const today=this.getTodayDayOfYear();
    if(ev.detail.value==='today') {
      this.startDay=today;
      this.endDay=today;
    }
    if(ev.detail.value==='week') {
      this.startDay=Math.max(1,today-6);
      this.endDay=today;
    }
    if(ev.detail.value==='month') {
      this.startDay=Math.max(1,today-29);
      this.endDay=today;
    }
    this.updateRangeAndFetch();
  }
  formatDate(date:any):string {
    if(!date)
      return '';
    const d=new Date(date);
    if(isNaN(d.getTime()))
      return '';
    return d.toLocaleDateString('es-CO');
  }
  initCurrentMonthRange() {
    const today=new Date();
    const todayDayOfYear=this.getTodayDayOfYear();
    const firstDayOfMonth=new Date(today.getFullYear(),today.getMonth(),1);
    const startDayOfYear=this.getDayOfYear(firstDayOfMonth);
    this.dayRange={
      lower:startDayOfYear,
      upper:todayDayOfYear
    };
    this.syncDays();
  }
  getDayOfYear(date:Date):number {
    const start=new Date(date.getFullYear(),0,0);
    const diff=
      date.getTime()-
      start.getTime()+
      (
        start.getTimezoneOffset()-
        date.getTimezoneOffset()
      )*60*1000;
    return Math.floor(
      diff/
      (
        1000*
        60*
        60*
        24
      )
    );
  }
  copyToClipboard(text:string|undefined) {
    if(!text)
      return;
    navigator.clipboard
      .writeText(text)
      .then(()=>{
        console.log('Copiado:',text);
        this.utilService.presentToast('copied: '+text,'default',400);
      })
      .catch(err=>{
        console.error('Error al copiar:',err);
      });
  }

  shipInName(p){}
  shipOutName(p){}
  diff(p){}

  openLink(url: string): void {
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  goBack() {
    this.location.back();
  }

  onColorPickerOpen(item: any, color: string): void {
    console.log('onColorPickerOpen');
    console.log('item:', item);
    console.log('color:', color);
  }

  onColorChange(item: any, color: string): void {
    console.log('onColorChange');
    console.log('item:', item);
    console.log('color:', color);
    item.data.color=color;
    this.patchItem(item)
  }
 
  patchItem(item:any) {
    console.log("item to patch",item)
    this.withdrawnService.patch(item.id,item.data).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
        //this.utilService.presentToast("registro actualizado exitosamente","success",1000);
      },
      error: (err) => {
        console.error("Withdrawn patch error", err);
      }
    });
  }

  /** Ajusta automáticamente la altura del textarea,  mientras el usuario escribe. */
  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  onTextBlur(item: any, event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    // Volver a una sola línea visual
    textarea.style.height = '';
    // Normalizar
    const normalized = this.normalizeText(textarea.value);
    // Actualizar modelo
    item.data.note = normalized;
    console.log("Item:", item);
    console.log("Texto normalizado:", normalized);
    this.patchItem(item);
  }

  /** Normaliza el texto antes de almacenarlo. */
  private normalizeText(text: string): string {
    return text
      .normalize("NFC")
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s\-./]/g, "");
  }

  getLevel(item: any): string {
    const updatedAt = new Date(item.updated_at);
    const now = new Date();
    const diffDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    const olderThan8Days = diffDays > 8;
    //console.log('updated_at', item.updated_at);
    //console.log('diffDays', diffDays);

    const data = item.data;
    if (data?.shipout > 0 && data?.shipout != 3 && olderThan8Days) return 'sai';
    if (data?.shipout > 0 && data?.shipout != 3) return '->sai';
    if (data?.deliveryout?.length > 2) return 'puerto';
    if (data?.wtare > 1000 && data?.wnet > 1000) return '->puerto';
    if (data?.kg > 10) return 'ctg';
    if (data?.deliveryin?.length > 2 && data?.datein?.length > 2) return 'ctg';
    return '';
  }

  mapFullWithdrawnList(list: any[]): any[] {
    return list.map(item => ({ ...item, level: this.getLevel(item) }));
  }

  /*mapFullWithdrawnList(fullWithdrawnList:any[]):any[]{*/
    /*fullWithdrawnList.map((it)=>{it.})*/
  /*}*/


}
