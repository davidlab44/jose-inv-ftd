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



@Component({
  selector: 'page-readren',
  templateUrl: 'readren.html',
  styleUrls: ['./readren.scss'],
})
export class ReadrenPage {

  ios: boolean;
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
  ) {}



  printSelectedBarcodes(p: Product) {
    const paddedId = p.id.toString().padStart(6, '0');
    const selectedBarcodes = [paddedId];
    this.barcodeService.downloadPDF(selectedBarcodes);
  }


  hash:string='';
  table:any
  async ngOnInit() {
    console.log("ngOnInit")
    await this.loadCategories();
    await this.loadUms();
    this.getAllProducts();
    this.searchSubject.pipe(
      debounceTime(1000),          // espera 1 segundo
      distinctUntilChanged(),      // solo si el texto cambia
      switchMap(text => this.productService.searchProducts(text))
    )
    .subscribe({
      next: results => {
        console.log("Resultados de búsqueda:", results);
        this.productList = results;    // si quieres mostrar los productos encontrados
      },
      error: err => console.error("Error en búsqueda:", err)
    });
  }


  updateSchedule(){
  }

  ionViewDidEnter() {}

  posCategId:number=0
  productList:Product[]=[];
  getAllProducts() {
    this.productService.getAllProducts().subscribe({
      next: response => {
        this.productList=response;
        console.log('products By Cat',this.productList)
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
    // Validar ID recibido
    if (id === null || id === undefined) {
      return 'Sin UM';
    }

    const idNum = Number(id);
    if (isNaN(idNum)) {
      return 'Sin UM';
    }

    // Validar que this.ums exista y tenga elementos
    if (!Array.isArray(this.ums) || this.ums.length === 0) {
      return 'Sin UM';
    }

    // Buscar la UM por ID
    const um = this.ums.find(u => Number(u.id) === idNum);
    if (!um) {
      return 'Sin UM';
    }

    // Extraer el nombre si existe y es válido
    const nombre = um?.datos?.name;
    if (typeof nombre === 'string' && nombre.trim() !== '') {
      return nombre;
    }

    return 'Sin UM';
  }


  onSearch(text: string) {
    this.searchSubject.next(text);
  }


  /**
   * Formatea una fecha en estilo amigable con hora en 12h y segundos
   * Ejemplo: "12 agosto de 2025 11:39:20 AM"
   * @param dateInput puede ser string, Date o timestamp
   */
  formatFechaLatam(dateInput: string | Date | number): string {
    if (!dateInput) return '';

    const date = new Date(dateInput);

    // Día, mes (nombre) y año
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    const fechaTexto = new Intl.DateTimeFormat('es-ES', opciones).format(date);

    // Hora en 12h con AM/PM
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




