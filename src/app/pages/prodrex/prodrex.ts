import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { OpportunityService } from '../../services/opportunity.service';
import { PosOrderService } from '../../services/pos-order.service';
import { TableService } from '../../services/table.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../interfaces/session';
import { SessionService } from '../../services/session.service';
import { UtilService } from '../../services/util.service';
import { ProductService } from '../../services/product.service';
import { BarcodeService } from '../../services/barcode.service';
import { CategoryService } from '../../services/category.service';
import { UmService } from '../../services/um.service';
import { Product } from '../../interfaces/product';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DateService } from '../../services/local/date.service';
import { RexService } from '../../services/rex.service';
import { ProdrexService } from '../../services/prodrex.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'page-prodrex',
  templateUrl: 'prodrex.html',
  styleUrls: ['./prodrex.scss'],
})
export class ProdrexPage {

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
    private userService: UserService
  ) {}

  /* printSelectedBarcodes(p: Product) {*/
    /*const paddedId = p.id.toString().padStart(6, '0');*/
    /*const selectedBarcodes = [paddedId];*/
    /*this.barcodeService.downloadPDF(selectedBarcodes);*/
  /*}*/

  hash:string='';
  table:any
  rexDocument:any;
  async ngOnInit(){
  }

  async refreshView() {
    await this.loadCategories();
    await this.loadUms();
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
    this.loadUsers();
    this.rexService.getLast().subscribe({
      next: (response) => {
        if(response && response.length && response.length>0){
          console.log('getLast RSPNS',response)
          if(response[0].state=='draft'){
            this.rexDocument=response;
            console.log('this.rexdocument',response)
          }else{
            this.utilService.presentToast('creando rex')
            this.rexService.addRex().subscribe({
              next: (r)=>{
                console.log('addRex response ',r)
                this.rexService.getLast().subscribe({
                  next: (res)=>{
                    console.log('getLast res response',res)
                  }
                })
              }
            })
          }
        }
        //console.log("response rex table",response)
      }
    })

    this.productService.getCachedOrServer().subscribe(data => {
      this.productListCaos = data;
    });
  }
  
  userList:any[]=[];
  loadUsers(){
    this.userService.getAll().subscribe({
      next: (response)=>{
        console.log("users",response)
        this.userList=response;
      }
    })
  }


  updateSchedule(){
     
  }

  productListCaos:any[]=[];

  ionViewWillEnter() {
    this.refreshView();
  }


  ionViewDidEnter(){
    this.refreshProdrexList();
  }

  prodrexList:any[]=[];
  refreshProdrexList() {
    this.prodrexList=[];
    this.prodrexService.getAll().subscribe({
      next: response=>{
        if(this.rexDocument.length && this.rexDocument.length>0){
          response.forEach(prodrex => {
            if(prodrex.data.id_rex==this.rexDocument[0].id){
              this.prodrexList.push(prodrex);
            }
          });
        }else{
          this.utilService.presentToast('rexDocument is empty')
        }
      }
    })
  }
  
  posCategId:number=0
  productList:Product[]=[];
  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: response => {
        this.productList=response;
        //console.log('products By Cat',this.productList)
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }

  categories: any[] = [];    
    loadCategories() { 
      this.categoryService.getAllCategories().subscribe({ 
        next: (res) => {       
          this.categories = res;          
          this.categoryService.saveCategoriesToLocal(res); // Guarda en localStorage 
        }, 
        error: (err) => {      
          console.error('❌ Error al cargar categorías:', err); 
          this.categories = this.categoryService.getCategoriesFromLocal(); 
        } 
      }); 
    }   
    ums: any[] = []; 
    loadUms() {                
      this.umService.getAllUms().subscribe({ 
        next: (res) => {       
          console.log('✅ Ums:', res);    
          this.ums = res; 
          this.umService.saveUmsToLocal(res); 
        }, 
        error: (err) => {      
          console.error('❌ Error al cargar categorías:', err); 
          this.ums = this.umService.getUmsFromLocal(); 
        } 
      }); 
    }     
      
    getCategoryNameById(id: number | null | undefined): string {
      if (id === null || id === undefined) {
        return 'Sin categoría';
      }

      if (!Array.isArray(this.categories) || this.categories.length === 0) {
        return 'Sin categoría';
      }

      const cat = this.categories.find(c => Number(c.id) === Number(id));

      const nombre = cat?.datos?.nombre;

      return typeof nombre === 'string' && nombre.trim() !== ''
        ? nombre
        : 'Sin categoría';
    }


  getUmNameById(id: number | string | null | undefined): string {
    if (id === null || id === undefined) {
      return 'Sin UM';
    }
    const idNum = Number(id);
    if (isNaN(idNum)) {
      return 'Sin UM';
    }
    if (!Array.isArray(this.ums) || this.ums.length === 0) {
      return 'Sin UM';
    }
    const um = this.ums.find(u => Number(u.id) === idNum);
    if (!um) {
      return 'Sin UM';
    }
    const nombre = um?.datos?.name;
    if (typeof nombre === 'string' && nombre.trim() !== '') {
      return nombre;
    }
    return 'Sin UM';
  }


  getProductNameById(id: number | string | null | undefined): string {
    //console.log("id product pasado", id);
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
    console.log("userList",this.userList)    
    this.ownerId=0;
    this.hasOwner=false;
  }

  ownerId=0
  selectUser(u: any) {
    const rexId = this.rexDocument[0].id;
    this.rexService.addUserOwner(rexId, u.id).subscribe({
      next: (res) => {
        if (res?.length && res[0]?.data?.id_user > 0) {
          this.ownerId = res[0].data.id_user;
          this.hasOwner = true;
        }
      },
      error: err => console.error(err)
    });
  }

  /*ownerId=0*/
  /*selectUser(u){*/
    /*console.log("component u pasado",u)*/
    /*console.log("rexDocument[0]",this.rexDocument)*/
    /*this.rexService.addUserOwner(this.rexDocument[0],u.id).subscribe({*/
      /*next: (res) =>{*/
        /*console.log("res para usar",res)*/
        /*if(res[0].data.id_user > 0){*/
          /*this.ownerId=res[0].data.id_user;*/
          /*this.hasOwner=true;*/
        /*} */
      /*}*/
    /*})*/
  /*}*/

  removeFromProdrex(prdct:any){
    this.productService.getProductById(prdct.data.id_product).subscribe({
      next: (r)=>{
        r[0].data.qty=Number(r[0].data.qty)+Number(prdct.data.qty);
        console.log('r[0]',r[0].data)
        this.productService.patch(r[0].id,r[0].data).subscribe({
          next: (r)=>{
            console.log('updated',r)
            this.prodrexService.removeFromProdrex(prdct.id).subscribe({
              next: (response)=>{
                console.log('prodrex deleted',response);
                this.prodrexService.getAll().subscribe({
                  next: response=>{
                    this.prodrexList=response;
                    console.log("getProdRexList",response)
                  }
                })
                this.rexService.getAll().subscribe({
                  next: (response) => {
                    this.rexDocument=response;
                    console.log("response rex table",response)
                  }
                })
              }
            });
          }
        })
      }
    })
    //actualizar la cantidad (updateqty)
    //eliminar el producto
  }

  addToOrder(p){
    console.log('p',p)
  }

  markAsDelivered(){
    this.rexService.markAsDelivered(this.rexDocument[0].id,'delivered').subscribe({
      next: (response)=>{
        console.log('markAsDelivered response',response)
        this.router.navigate(['/app/tabs/schedule']);
      }
    });
  }


}




