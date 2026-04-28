import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { OpportunityService } from '../../../../services/opportunity.service';
import { PosOrderService } from '../../../../services/pos-order.service';
import { TableService } from '../../../../services/table.service';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../../../interfaces/session';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { CategoryService } from '../../../../services/category.service';
import { UmService } from '../../../../services/um.service';
import { Product } from '../../../../interfaces/product';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { DateService } from '../../../../services/local/date.service';
import { RexService } from '../../../../services/rex.service';
import { ProdrexService } from '../../../../services/prodrex.service';
import { UserService } from '../../../../services/user.service';
import { ReplenishmentService } from '../../../../services/replenishment/replenishment.service';
import { PhotoService } from '../../../../services/asset/photo.service';
import { OcrService } from '../../../../services/ai/ocr.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { GlppricesService } from '../../../../services/replenishment/glpprices.service';
import { AllocService } from '../../../../services/replenishment/alloc.service';
import { Withdrawn, WithdrawnData, createDefaultWithdrawn } from '../../../../interfaces/product';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

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
  todayDate:any;
  form!: FormGroup;
  replenishmentList: any[] = [];
  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;
  glpPrice:number = 0;
  glpAlloc:number = 0;
  glpType:number = 0;

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
    private fb: FormBuilder ,
    private replenishmentService : ReplenishmentService,
    private photoService: PhotoService,
    private ocrService: OcrService,
    private ccoService: CcoService,
    private allocService: AllocService,
    private glpPricesService: GlppricesService,
    private withdrawnService: WithdrawnService
  ) {}

  hash:string='';
  table:any
  rexDocument:any;

  item:any;
  withdrawnList:any[]=[];
  ngOnInit() {
    const nav = history.state;
    this.item = nav.item;
    this.withdrawnList = nav.list;
    this.form = this.fb.group({
      name: [''],
      date: [''],
      ticket: [''],
      kg: [0],
      psi: [0],
      rotogate: [0],
      seal: this.fb.array([]),
    });
    const ahora = new Date();
    //this.todayDate=this.formatFechaLatam(ahora);
    this.displayLast();
  }


  lastAsset:any;
  displayLast() {
    this.productService.getAll().subscribe({
      next: (response) => {
        this.lastAsset = response.reduce((max, item) =>
          item.id > max.id ? item : max
        );
      }
    });
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){}

  ionViewWillEnter() {
    this.loadCco();
    this.loadGlpAlloc();
    this.loadGlpPrice()
  }

  ionViewDidEnter() {}

  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

/*  formatFechaLatam(dateInput: string | Date | number): string {*/
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
    /*if (horas === 0) horas = 12; // 12 AM o 12 PM en lugar de 0*/
    /*const horasTexto = String(horas).padStart(2, '0');*/
    /*return `${fechaTexto} ${horasTexto}:${minutos}:${segundos} ${ampm}`;*/
  /*}*/

  async takePhotoAndUpload() {
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedUrl = null;
    const base64Image = await this.photoService.takePicture();
    if (!base64Image) {
      this.uploading = false;
      console.error('No se pudo obtener la imagen');
      return;
    }
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image);
    progress$.subscribe({
      next: (p) => this.uploadProgress = p,
      error: (err) => {
        console.error('Error subiendo imagen', err);
        this.uploading = false;
      }
    });
    url$.subscribe({
      next: (url) => {
        this.uploadedUrl = url;
        this.launchOcr(url);
      },
      error: (err) => {
        console.error('Error obteniendo URL', err);
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  async pickImageAndUpload() {
    this.uploading = true;
    this.uploadProgress = 0;
    this.uploadedUrl = null;
    const base64Image = await this.photoService.pickImage();
    if (!base64Image) {
      this.uploading = false;
      return;
    }
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image);
    progress$.subscribe(p => this.uploadProgress = p);
    url$.subscribe({
      next: (url) => {
        this.uploadedUrl = url;
        // lanzar OCR cuando la URL esté disponible
        this.launchOcr(url);
      },
      error: (err) => {
        console.error('Error upload', err);
        this.uploading = false;
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  ocrResponse:any;
  launchOcr(url:string){
    this.ocrService.postVendor(url).subscribe({
      next: (res) => {
        this.ocrResponse=res;
        console.log('OCR Response:', this.ocrResponse);
        console.log('ocrResponse.data:', this.ocrResponse.data);
        console.log('ocrResponse.data.date:', this.ocrResponse.data.date);
        this.updateUi();
      },
      error: (err) => {
        console.error('Error OCR:', err);
      }
    })
    ;
  }

  get seals(): FormArray {
    return this.form.get('seal') as FormArray;
  }

  isotanq:any;
  updateUi(){
    const data = this.ocrResponse.data;
    const normalizedDate = this.normalizeOCRDate(data.date);
    this.form.patchValue({
      date: normalizedDate,
      name: "TCSU "+data.isotanq ?? null,
      ticket: data.ticket ?? null,
      kg: data.kg ?? null,
      psi: data.psi ?? null,
      rotogate: data.rotogate ?? null,
    });
    this.seals.clear();
    if (data.seal && Array.isArray(data.seal)) {
      data.seal.forEach((s: string) => {
        this.seals.push(this.fb.control(s));
      });
    }
    this.isotanq = this.validateIsotanqName(data.isotanq, this.ccos);
  }

   ccos: any[] = []; 
   loadCco() {                
     this.ccoService.getAll().subscribe({ 
        next: (res) => {       
          console.log('✅ Cco:', res);    
          this.ccos = res;
        }, 
        error: (err) => {      
          console.error(' Error al cargar cco:', err); 
        } 
      }); 
   } 

   glpPriceList: any[] = []; 
   loadGlpPrice() {              
     this.glpPricesService.getAll().subscribe({ 
        next: (res) => {       
          console.log('✅glpPrices',res);    
          this.glpPriceList = res;

        }, 
        error: (err) => {      
          console.error(' Error al cargar glpPrices:', err); 
        } 
      }); 
   } 

   glpAllocList: any[] = []; 
   glpAllocPureList: any[] = []; 
   loadGlpAlloc() {                
     this.allocService.getAll().subscribe({ 
        next: (res) => {       
          console.log('✅ Glp Alloc:', res);    
          this.glpAllocList = res;
          this.glpAllocPureList = this.obtenerGlpAllocVigentes(this.glpAllocList);
          // luego haces lo que quieras:
          console.log("pure Alooc List",this.glpAllocPureList);
          const nacional = this.glpAllocPureList[0];
          const importado = this.glpAllocPureList[1];

        }, 
        error: (err) => {      
          console.error(' Error al cargar glp alloc:', err); 
        } 
      }); 
   } 

   validateIsotanqName(hash: string, ccos: any[]): any | null {
    if (!hash || !ccos) {
      return null;
    }
    const cleanHash = hash.trim();
    for (const cco of ccos) {
      const name: string = cco?.data?.name || '';
      const match = name.match(/(\d{6}-\d)/);
      if (match && match[1] === cleanHash) {
        return cco;
      }
    }
    return null;
  }

  guardar() {
    const formData: Partial<WithdrawnData> = this.form.value;
    const withdrawn: Withdrawn = createDefaultWithdrawn();
    withdrawn.data = {
      ...withdrawn.data,
      ...formData,
      seal: this.seals.value 
    };
    withdrawn.data.name = this.isotanq?.id ?? null;
    withdrawn.data.img = this.uploadedUrl;
    withdrawn.data.id_replenishment_product = this.procesarRetiroGLP(this.glpAllocPureList,withdrawn.data.kg)
    const payload = withdrawn.data;
    console.log("payload to post =>", payload);
    this.withdrawnService.post(payload).subscribe({
      next: (response) => {
        console.log("Withdrawn post response", response);
        this.utilService.presentToast("registro actualizado exitosamente","success",1000);
        this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],   { replaceUrl: true });  
      },
      error: (err) => {
        console.error("Withdrawn post error", err);
      }
    });
  }


  normalizeOCRDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn("Fecha OCR inválida:", dateStr);
      return null;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
  }

  obtenerGlpAllocVigentes(glpAllocList: any[]): any[] {
    const now = new Date();
    // 1. Filtrar vigentes
    const vigentes = glpAllocList.filter((glpAlloc) => {
      const init = new Date(glpAlloc.data.init);
      const end = new Date(glpAlloc.data.end);
      return now >= init && now <= end;
    });
    // 2. Validación de cantidad
    if (vigentes.length !== 2) {
      console.log('⚠️ ERROR: deben existir exactamente 2 registros vigentes', {
        cantidad: vigentes.length,
        vigentes,
      });
    }
    // 3. Separar por tipo
    const nacionales = vigentes.filter(
      (g) => g.data.id_replenishment_product === 1
    );
    const importados = vigentes.filter(
      (g) => g.data.id_replenishment_product === 2
    );
    // 4. Validaciones de integridad
    if (nacionales.length === 0) {
      console.log('⚠️ ERROR: no existe registro NACIONAL (id=1)', vigentes);
    }
    if (importados.length === 0) {
      console.log('⚠️ ERROR: no existe registro IMPORTADO (id=2)', vigentes);
    }
    if (nacionales.length > 1) {
      console.log('⚠️ ERROR: hay múltiples registros NACIONALES duplicados', nacionales);
    }
    if (importados.length > 1) {
      console.log('⚠️ ERROR: hay múltiples registros IMPORTADOS duplicados', importados);
    }
    // 5. Selección segura (primer válido de cada tipo)
    const nacional = nacionales[0];
    const importado = importados[0];
    // 6. Retorno limpio y ordenado
    const resultado: any[] = [];
    if (nacional) resultado.push(nacional);
    if (importado) resultado.push(importado);
    return resultado;
  }

  procesarRetiroGLP(glpAllocPureList: any[], kg: number): number {
    if (!Array.isArray(glpAllocPureList) || glpAllocPureList.length === 0) {
      console.log('⚠️ ERROR: lista glpAllocPureList inválida');
      return 0;
    }

    const itemNacional = glpAllocPureList.find(
      (g) => g.data.id_replenishment_product === 1
    );

    const itemImportado = glpAllocPureList.find(
      (g) => g.data.id_replenishment_product === 2
    );
    if (!itemNacional) console.log('⚠️ ERROR: no existe item nacional');
    if (!itemImportado) console.log('⚠️ ERROR: no existe item importado');
    // ====== 1. NACIONAL ======
    if (itemNacional) {
      const resultadoNacional =
        (itemNacional.data.acum + itemNacional.data.alloc) - kg;
      itemNacional.data.acumnext = resultadoNacional;
      if (resultadoNacional >= -10000) {
        return 1; // ✅ usar nacional
      }
      console.log(
        '⚠️ Nacional fuera de rango (< -10000), se pasa a importado',
        resultadoNacional
      );
    }
    // ====== 2. IMPORTADO ======
    if (itemImportado) {
      const resultadoImportado =
        (itemImportado.data.acum + itemImportado.data.alloc) - kg;
      itemImportado.data.acumnext = resultadoImportado;
      if (resultadoImportado < -100000) {
        console.log(
          '⚠️ Importado fuera de rango (< -100000), pero se permite continuar',
          resultadoImportado
        );
      }
      return 2; // 🔥 SIEMPRE usar importado en fallback
    }
    console.log('⚠️ ERROR CRÍTICO: no existe fuente válida');
    return 0;
  }

  sumKgMesActual(withdrawnList: any[]): number {
    try {
      if (!Array.isArray(withdrawnList) || withdrawnList.length === 0) {
        return 0;
      }

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      let total = 0;

      for (let i = 0; i < withdrawnList.length; i++) {
        const data = withdrawnList[i]?.data;

        if (!data?.date) continue;

        const d = new Date(data.date);
        if (isNaN(d.getTime())) continue;

        if (
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        ) {
          total += Number(data.kg) || 0;
        }
      }

      return total;

    } catch (error) {
      console.error('sumKgMesActual error:', error);
      return 0;
    }
  }


}




