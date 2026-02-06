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
import { GlppricesService } from '../../../services/replenishment/glpprices.service';

@Component({
  selector: 'page-price',
  templateUrl: 'price.html',
  styleUrls: ['./price.scss'],
})
export class PricePage {

  ios: boolean;
  importado: boolean=false;
  hasOwner: boolean = false;
  showSearchbar: boolean;
  queryText:any
  searchSubject = new Subject<string>();
  todayDate:any

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
    private glpricesService : GlppricesService
  ) {}

  hash:string='';
  table:any
  rexDocument:any;
  glppricesList:any[]=[];

  async ngOnInit() {
    const ahora = new Date();
    this.todayDate = this.formatFechaLatam(ahora);
    this.getAllPrices();
    const now = new Date();
    // ⏰ Inicio del día: 00:00
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0
    );
    // ⏰ Fin del día: 23:59
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 0
    );
    this.dateTimeStart = this.toLocalDateTime(startOfDay);
    this.dateTimeEnd   = this.toLocalDateTime(endOfDay);
  }

  /*async ngOnInit() {*/
    /*const ahora = new Date();*/
    /*this.todayDate = this.formatFechaLatam(ahora);*/
    /*this.getAllPrices();*/
      /*const now = new Date();*/
      /*// Fecha local con hora 00:00 (SIN UTC)*/
      /*const localMidnight = new Date(*/
        /*now.getFullYear(),*/
        /*now.getMonth(),*/
        /*now.getDate(),*/
        /*0, 0, 0*/
      /*);*/
      /*this.dateTimeStart = this.toLocalDateTime(localMidnight);*/
      /*this.dateTimeEnd   = this.toLocalDateTime(localMidnight);*/
  /*}*/

    dateTimeStart!: string;
    dateTimeEnd!: string;
    
    onDateTimeChange() {
      const payload = {
        start_datetime: this.formatForBackend(this.dateTimeStart),
        end_datetime: this.formatForBackend(this.dateTimeEnd)
      };
      console.log('Inicio (raw):', this.dateTimeStart);
      console.log('Fin (raw):', this.dateTimeEnd);
      console.log('Payload backend:', payload);
    }

    // YYYY-MM-DDTHH:mm:ss  → para ion-datetime (local)
    toLocalDateTime(date: Date): string {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
             `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    }

    // YYYY-MM-DD HH:mm:ss → backend / DB
    formatForBackend(value: string): string {
      const d = new Date(value);
      const pad = (n: number) => n.toString().padStart(2, '0');

      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
             `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    }


  /*selectedDate!: string;*/
  /*selectedTime!: string;*/

  /*onDateTimeChange() {*/
    /*const fechaHora = `${this.selectedDate} ${this.selectedTime}`;*/

    /*console.log('Fecha seleccionada:', this.selectedDate);*/
    /*console.log('Hora seleccionada:', this.selectedTime);*/
    /*console.log('Fecha + Hora:', fechaHora);*/
  /*}*/


  getAllPrices(){
    this.glpricesService.getAll().subscribe({
      next: (response) => {
        console.log("glp prices table", response);
        this.glppricesList = response.slice().reverse();
        this.getMaxIdItem(this.glppricesList);
        this.getMaxImportedItem(this.glppricesList);
        console.log("Nacional:", this.lastGlpprice);
        console.log("Importado:", this.lastImportedPrice);
      }
    });   
  }

  numero: number;
  valor:number=0
  mostrarValor() {
    console.log('Valor ingresado:', this.valor);
  }

  mostrarNumero() {
    console.log("Número ingresado:", this.numero);
  }
  
  updateSchedule(){
     
  }

  addGlpprice(price:number){
    let idReplenishmentProduct:number=1;
    if(!this.importado){
      idReplenishmentProduct=1;
    }else{
      idReplenishmentProduct=2;
    }
    this.glpricesService.addGlpprice(price,this.dateTimeStart,this.dateTimeEnd,idReplenishmentProduct).subscribe({
      next: (response)=>{
        console.log("response",response)
        this.getAllPrices();
      }
    })
  }

  get currentPrice() {
    return this.importado ? this.lastImportedPrice : this.lastGlpprice;
  }

  lastGlpprice: any = null;
  getMaxIdItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 1);

    if (filtered.length === 0) {
      this.lastGlpprice = null;
      return null;
    }

    this.lastGlpprice = filtered.reduce((max, item) =>
      item.id > max.id ? item : max
    );
  }


  lastImportedPrice: any = "";
  getMaxImportedItem(items: any[]) {
    if (!items || items.length === 0) {
      return null;
    }
    const filtered = items.filter(i => i.data?.id_replenishment_product === 2);
    if (filtered.length === 0) {
      this.lastImportedPrice = null;
      return null; // No imported items found
    }
    this.lastImportedPrice = filtered.reduce((max, item) =>
      item.id > max.id ? item : max
    );
    console.log("lastImportedPrice.data", this.lastImportedPrice.data);
  }

  getFormatedDate(){
    return
  }
  
  ionViewWillEnter() {
  }

  ionViewDidEnter() {
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




