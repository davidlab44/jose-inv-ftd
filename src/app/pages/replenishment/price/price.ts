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
  hasOwner:boolean=false;
  segment = 'all';
  showSearchbar: boolean;
  opportunities = [];
  storedObject: any;
  posOrders: any[] = [];
  posOrderLineList: any[] = [];
  pendingCommands: any[] = [];
  deliveredList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any
  mesas: any[] = [];
  activeSession: Session | null = null;
  sessionId: number | null = null;
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

  printSelectedBarcodes(p: Product) {
    const paddedId = p.id.toString().padStart(6, '0');
    const selectedBarcodes = [paddedId];
    this.barcodeService.downloadPDF(selectedBarcodes);
  }

  hash:string='';
  table:any

  rexDocument:any;
  glppricesList:any[]=[];
  async ngOnInit() {
    //await this.loadCategories();
    //await this.loadUms();
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
    //this.loadUsers();
    this.glpricesService.getAll().subscribe({
      next: (response) => {
        console.log("glp prices table",response);
        this.glppricesList=response;
        this.getMaxIdItem(this.glppricesList);
      }
    })
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

  addGlpprice(price:number,idReplenishmentProduct:number){
    this.glpricesService.addGlpprice(price,idReplenishmentProduct).subscribe({
      next: (response)=>{
        console.log("response",response)
      }
    })
  }

  lastGlpprice:any="";
  getMaxIdItem(items: any[]){
    if (!items || items.length === 0) {
      return null; // No hay elementos
    }
    this.lastGlpprice= items.reduce((max, item) =>
      item.id > max.id ? item : max
    );
    console.log('lastGlpprice.data',this.lastGlpprice.data)

  }

  getFormatedDate(){
    return
  }
  productListCaos:any[]=[];
  ionViewWillEnter() {
    this.productService.getCachedOrServer().subscribe(data => {
      this.productListCaos = data;
    });
  }

  prodrexList:any[]=[];
  ionViewDidEnter() {
    this.prodrexService.getAll().subscribe({
      next: response=>{
        this.prodrexList=response;
        //console.log("getProdRexList",response)
      }
    })
  }
  
  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }

  getProductNameById(id: number | string | null | undefined): string {

    if (id === null || id === undefined) return 'Sin Nombre';

    const idNum = Number(id);
    if (isNaN(idNum)) return 'Sin Nombre';

    if (!Array.isArray(this.productListCaos) || this.productListCaos.length === 0) {
      return 'Sin Nombre';
    }

    const product = this.productListCaos.find(p => Number(p.id) === idNum);
    if (!product) return 'Sin Nombre';

    const name = product?.data?.name;
    if (typeof name === 'string' && name.trim() !== '') {
      return name;
    }
    return 'Sin Nombre';
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




