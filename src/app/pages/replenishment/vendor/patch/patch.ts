import { Component, ViewChild, ElementRef } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from '../../../../services/asset/photo.service';
import { OcrService } from '../../../../services/ai/ocr.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { Withdrawn, WithdrawnData, createDefaultWithdrawn } from '../../../../interfaces/product';
import { GlppricesService } from '../../../../services/replenishment/glpprices.service';

@Component({
  selector: 'page-patch',
  templateUrl: 'patch.html',
  styleUrls: ['./patch.scss'],
})
export class PatchPage {

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
  replenishment:any;
  //assetSupplyProduct:any;
  movement:any;
  cco:any;
  //imported:any;
  glppricesList: any[] = [];
  numero!: number;
  cents!: number;
  lastGlpprice: any = null;
  lastImportedPrice: any = null;

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
    private photoService: PhotoService,
    private ocrService : OcrService,
    private withdrawnService : WithdrawnService,
    private ccoService : CcoService,
    private glpricesService: GlppricesService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.item) {
      this.movement = navigation.extras.state.item;
      this.uploadedUrl = this.movement.data.img;
      //this.imported=this.movement.id_replenishment_product;
    } else {
      // Si recargaron la página, puedes cargar el item desde un servicio o API
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibidox:", this.movement);
  }

  ngOnInit(){
    this.form = this.fb.group({
      id: [this.movement?.id ?? null],
      fecha: [this.movement?.data.date ?? ''],
      name: [this.movement?.data.name ?? ''],
      ticket: [this.movement?.data.ticket ?? ''],
      sello1: [this.movement?.data.seal[0] ?? ''],
      sello2: [this.movement?.data.seal[1] ?? ''],
      sello3: [this.movement?.data.seal[2] ?? ''],
      kg: [this.movement?.data?.kg ?? ''],
      rotogate: [this.movement?.data?.rotogate ?? 0], 
      psi: [this.movement?.data?.psi ?? 0], 
      imported: [this.movement?.data?.id_replenishment_product ?? 0], 
      price: [this.movement?.data?.price ?? 0], 
    });
    this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.applyFilter(text);
      });
  }

  ionViewWillEnter() {
    this.form.patchValue({
      id: this.movement?.id ?? null,
      fecha: this.movement?.data?.date ?? '',
      name: this.movement?.data?.name ?? '',
      ticket: this.movement?.data?.ticket ?? '',
      sello1: this.movement?.data?.seal?.[0] ?? '',
      sello2: this.movement?.data?.seal?.[1] ?? '',
      sello3: this.movement?.data?.seal?.[2] ?? '',
      kg: this.movement?.data?.kg ?? '',
      rotogate: this.movement?.data?.rotogate ?? 0,
      psi: this.movement?.data?.psi ?? 0,
      imported: this.movement?.data?.id_replenishment_product ?? 0,
      price: this.movement?.data?.price ?? 0
    });
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      categ: null,
      name: '',
      bop: '',
      barcode: '',
      qty: 1,
      um: null,
      target: 0,
      reorder: 0,
      minimum: 0,
    });
    this.uploadProgress = 0; 
    this.uploadedUrl= null;
    this.uploading = false;
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){
     
  }

  ccoList:any[]=[];
  ionViewDidEnter() {
 
  this.ccoService.getAll().subscribe({
      next: (response: any[]) => {
        console.log('cco List', response);
        this.ccoList = response;
        //this.filteredList = response; // inicializar
        this.resolveInitialCco();
      },
      error: (err: any) => {
        console.error('Error cargando CCO', err);
      }
    });
    this.getAllPrices();
  }

  onSearch(text: string) {
    this.applyFilter(text);
  }

  applyFilter(text: string) {
    if (!text || text.trim() === '') {
      this.filteredList = this.ccoList;
      return;
    }
    const search = this.normalize(text);
    this.filteredList = this.ccoList.filter(item => {
      const name = item?.data?.name || '';
      const normalizedName = this.normalize(name);
      return normalizedName.includes(search);
    });
  }

  normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/\s+/g, '')        // quitar espacios
      .replace(/[^a-z0-9]/g, '')  // quitar símbolos
      .replace(/0/g, 'o')         // OCR fix
      .replace(/1/g, 'i');        // OCR fix
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

  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;

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
        // aquí llamas el OCR
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

  launchOcr(url: string) {
    this.ocrService.postVendor(url).subscribe({
      next: (res) => {
        this.ocrResponse = res;
        this.ccoName="TCSU "+res?.data?.isotanq;
        //tengo que sacar el id , hay un metodo para eso 
        //
        console.log('OCR Response:', res);
        const normalizedDate = this.normalizeOCRDate(res?.data?.date);
        const seals = res?.data?.seal ?? [];
        // actualizar movement
        this.movement.data = {
          ...this.movement.data,
          date: normalizedDate,
          kg: Number(res?.data?.kg ?? 0),
          ticket: res?.data?.ticket ?? 0,
          psi: Number(res?.data?.psi ?? 0),
          rotogate: Number(res?.data?.rotogate ?? 0),
          seal: seals
        };
        //actualizar form para que UI refleje los cambios
        this.form.patchValue({
          fecha: normalizedDate,
          kg: Number(res?.data?.kg ?? 0),
          ticket: res?.data?.ticket ?? 0,
          psi: Number(res?.data?.psi ?? 0),
          rotogate: Number(res?.data?.rotogate ?? 0),
          sello1: seals[0] ?? '',
          sello2: seals[1] ?? '',
          sello3: seals[2] ?? ''
        });
        console.log("movement actualizado:", this.movement);
      },
      error: (err) => {
        console.error('Error OCR:', err);
      }
    });
  }
  
  updateMovementFromForm() {
    const f = this.form.value;
    this.movement.data = {
      ...this.movement.data,
      date: f.fecha,
      name: f.name,
      ticket: f.ticket,
      kg: Number(f.kg),
      psi: Number(f.psi),
      rotogate: Number(f.rotogate),
      seal: [f.sello1, f.sello2, f.sello3].filter(Boolean)
    };
  }

  patch() {
    console.log("patch price",this.form.value.price);
    this.updateMovementFromForm();
    this.movement.data.img = this.uploadedUrl;
    this.movement.data.name = this.ccoId;
    this.movement.data.price = Number(this.form.value.price) || 0;
    const payload = this.movement.data;
    console.log("payload to patch =>", payload);
    this.withdrawnService.patch(this.movement.id, payload).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
          this.utilService.presentToast("registro actualizado exitosamente","success",1000);
          this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],   { replaceUrl: true });  
      },
      error: (err) => {
        console.error("Withdrawn patch error", err);
      }
    });
  }
  
  normalizeOCRDate(dateStr: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn("Fecha OCR inválida:", dateStr);
      //imported: this.movement?.data?.id_replenishment_product ?? 0,
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

  filteredList: any[] = [];     //lista filtrada
  
  selectCco(item: any) {
    this.cco = item;
    this.ccoName = item.data.name;
    //actualizar movement (muy importante en tu flujo)
    if (this.movement?.data) {
      this.movement.data.name = item.id;
    }
    console.log('CCO seleccionado:', this.ccoName);
  }

  ccoName: string = '';   // nombre a mostrar
  ccoId: number = 0;   // id cco seleccionado a mostrar

  resolveInitialCco() {
    //validar que haya lista
    if (!this.ccoList || this.ccoList.length === 0) return;
    //obtener ID desde router
    const ccoId = this.movement?.data?.name;
    if (!ccoId) {
      console.warn('No hay ccoId en movement');
      return;
    }
    //buscar en lista
    const found = this.ccoList.find(item => item.id == ccoId);
    if (found) {
      this.cco = found;
      this.ccoName = found.data.name;
      this.ccoId = found.data.id;
      console.log('CCO encontrado:', this.ccoName);
    } else {
      console.warn('CCO no encontrado para id:', ccoId);
    }
  }

  isImportedGlp(ev: any) {
    const checked = ev.detail.checked;
    if(checked>0){
      this.movement.data.id_replenishment_product = checked ? 2 : 1;
    }
    console.log('id_replenishment_product nuevo =>', this.movement.data.id_replenishment_product);
  }

  getAllPrices() {
    this.glpricesService.getAll().subscribe({
      next: (response) => {
        this.glppricesList = response.slice().reverse();
        console.log("pricelist",this.glppricesList)
        this.getMaxIdItem(this.glppricesList);
        this.getMaxImportedItem(this.glppricesList);
      }
    });
  }

  getMaxIdItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 1);
    if (!filtered.length) return;
    this.lastGlpprice = filtered.reduce((max, item) =>
      item.id > max.id ? item : max
    );
    if (this.movement?.data?.id_replenishment_product == 1) {
      const price = Number(this.lastGlpprice.data.price) || 0;
      const cents = String(this.lastGlpprice.data.cents ?? 0).padStart(2, '0');

      this.form.patchValue({
        price: `${price}.${cents}`
      });
    }
  }

  getMaxImportedItem(items: any[]) {
    const filtered = items.filter(i => i.data?.id_replenishment_product === 2);
    if (!filtered.length) return;
    this.lastImportedPrice = filtered.reduce((max, item) => item.id > max.id ? item : max);
    console.log("getMaxImportedPrice",this.movement.data.id_replenishment_product)
    if (this.movement?.data?.id_replenishment_product == 2) {
        const price = Number(this.lastImportedPrice.data.price) || 0;
        const cents = String(this.lastImportedPrice.data.cents ?? 0).padStart(2, '0');
        this.form.patchValue({
          price: `${price}.${cents}`
        });
    }
  }


}




