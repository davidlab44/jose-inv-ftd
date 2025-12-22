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
  //segment = 'all';
  showSearchbar: boolean;
  //posOrders: any[] = [];
  //posOrderLineList: any[] = [];
  //pendingCommands: any[] = [];
  //deliveredList: any[] = [];
  //filteredProductList: any[] = [];
  //maxQtyDeliveredItems: any[] = [];
  queryText:any
  //mesas: any[] = [];
  //activeSession: Session | null = null;
  //sessionId: number | null = null;
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

  /*printSelectedBarcodes(p: Product) {*/
    /*const paddedId = p.id.toString().padStart(6, '0');*/
    /*const selectedBarcodes = [paddedId];*/
    /*this.barcodeService.printIn50mmPortablePrinterBt(selectedBarcodes);*/
  /*}*/

  hash:string='';
  table:any

  rexDocument:any;
  glppricesList:any[]=[];
    
  async ngOnInit() {
    const ahora = new Date();
    this.todayDate = this.formatFechaLatam(ahora);
    this.getAllPrices();
  }


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
    this.glpricesService.addGlpprice(price,idReplenishmentProduct).subscribe({
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



/*  getMaxIdItem(items: any[]){*/
    /*if (!items || items.length === 0) {*/
      /*return null; // No hay elementos*/
    /*}*/
    /*this.lastGlpprice= items.reduce((max, item) =>*/
      /*item.id > max.id ? item : max*/
    /*);*/
    /*console.log('lastGlpprice.data',this.lastGlpprice.data)*/
  /*}*/

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

  selectUsers(){
    //console.log("userList",this.userList)    
    this.ownerId=0;
    this.hasOwner=false;
  }

  ownerId=0
  selectUser(u){
    //console.log("component u pasado",u)
    this.rexService.addUserOwner(this.rexDocument[0],u.id).subscribe({
      next: (res) =>{
        console.log("res para usar",res)
        if(res[0].data.id_user > 0){
          this.ownerId=res[0].data.id_user;
          this.hasOwner=true;
        } 
      }
    })
  }


}




