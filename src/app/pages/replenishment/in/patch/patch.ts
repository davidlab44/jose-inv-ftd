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
import { ShipService } from '../../../../services/logistic/ship.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { Withdrawn, WithdrawnData, createDefaultWithdrawn } from '../../../../interfaces/product';

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
  movement:any;

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
    private shipService : ShipService,
    private withdrawnService : WithdrawnService,
    private ccoService : CcoService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.item) {
      this.movement = navigation.extras.state.item;
    } else {
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibido shipin patch:", this.movement);
  }

  /*ngOnInit() {*/
    /*this.form = this.fb.group({*/
      /*id: [this.movement?.id ?? null],*/
      /*deliveryin: [this.movement?.data?.deliveryin ?? ''], */
      /*datein: [this.movement?.data?.datein ?? ''], */
      /*tripin: [this.movement?.data?.tripin ?? ''], */
      /*shipin: [this.movement?.data?.shipin ?? 0], */
    /*});*/
  /*}*/

  /*ionViewWillEnter() {*/
    /*this.form = this.fb.group({*/
      /*id: [this.movement?.id ?? null],*/
      /*deliveryin: [this.movement?.data?.deliveryin ?? ''], */
      /*datein: [this.movement?.data?.datein ?? ''], */
      /*tripin: [this.movement?.data?.tripin ?? ''], */
      /*shipin: [this.movement?.data?.shipin ?? 0], */
    /*});*/
    /*//shipList solo se utiliza cuando el ocrResponde , opopr eso esta aqui*/
    /*this.getShip();*/
  /*}*/

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      deliveryin: [''],
      datein: [''],
      tripin: [''],
      shipin: [0],
    });
  }

  ionViewWillEnter() {
    this.form.patchValue({
      id: this.movement?.id ?? null,
      deliveryin: this.movement?.data?.deliveryin ?? '',
      datein: this.movement?.data?.datein ?? '',
      tripin: this.movement?.data?.tripin ?? '',
      shipin: this.movement?.data?.shipin ?? null,
    });
    this.getShip();
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      deliveryin: 0,
      datein: 0,
      tripin: '',
      shipin: 0,
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

  prodrexList:any[]=[];
  ionViewDidEnter() {
    this.prodrexService.getAll().subscribe({
      next: response=>{
        this.prodrexList=response;
        console.log("getProdRexList",response)
      }
    })
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

  shipId:any;
  shipNombreEsp:string | null; 
  launchOcr(url: string) {
    this.ocrService.postIn(url).subscribe({
      next: (res) => {
        console.log('OCR Response:', res);
        this.shipId=this.getShipId(res,this.shipList);
        if(this.shipId>0){
          console.log('shipId',this.shipId)
          this.shipNombreEsp=this.getShipNameById(this.shipId);

          console.log('shipNombreEsp',this.shipNombreEsp)
          this.shipNombreEsp=this.getShipNameById(this.shipId);
        }else{
          this.shipNombreEsp='Seleccionar'
        }
        const normalizedDate = this.normalizeOCRDate(res?.data?.date);
        this.movement.data = {
          ...this.movement.data,
          deliveryin: this.parseNumber(res?.data?.deliveryin ?? 0),
          datein: res?.data?.datein ?? '',
          tripin: res?.data?.tripin ?? '',
          //shipin: this.shipNombreEsp,
        };
        this.form.patchValue({
          deliveryin: this.parseNumber(res?.data?.deliveryin ?? 0),
          datein: res?.data?.datein ?? '',
          tripin: res?.data?.tripin ?? '',
          //shipin: this.shipNombreEsp,
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
      deliveryin: Number(f.deliveryin ?? ''),
      datein: f.datein ?? '',
      tripin: f.tripin ?? '',
      //shipin: Number(f.shipin ?? 0),
    };
  }

  patch() {
    this.updateMovementFromForm();
    this.movement.data.imgin = this.uploadedUrl;
    const payload = {
      ...this.movement.data,
      shipin: Number(this.form.value.shipin) || 0 
      //shipin: this.shipId ?? 0
    };
    console.log("payload to patch =>", payload);
    this.withdrawnService.patch(this.movement.id, payload).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
      },
      error: (err) => {
        console.error("Withdrawn patch error", err);
      }
    });
  }

  /*  patch() {*/
    /*this.updateMovementFromForm();*/
    /*const payload = { ...this.movement.data };*/
    /*console.log("payload to patch =>", payload);*/
    /*this.withdrawnService.patch(this.movement.id, payload).subscribe({*/
      /*next: (response) => {*/
        /*console.log("Withdrawn patch response", response);*/
      /*},*/
      /*error: (err) => {*/
        /*console.error("Withdrawn patch error", err);*/
      /*}*/
    /*});*/
  /*}*/

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

  parseNumber(input: string): number {
    if (!input) return 0; // por si es null o undefined
    // Elimina comas (o cualquier otro separador que no sea dígito o punto)
    const cleaned = input.replace(/,/g, '');
    // Intenta convertir a número
    const num = Number(cleaned);
    // Si no es un número válido, devuelve 0
    return isNaN(num) ? 0 : num;
  }

  getShipin(response:any){
    return response;
  }






   normalizeOCR(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[0]/g, 'o')
      .replace(/[1]/g, 'i')
      .replace(/[5]/g, 's')
      .replace(/[8]/g, 'b')
      .replace(/[^a-z0-9]/g, '')  // elimina espacios, guiones, etc
      .trim();
  }
  levenshtein(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
  similarity(a, b) {
    const dist = this.levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - dist / maxLen;
  }
  fuzzyMatch(a, b, threshold = 0.8) {
    if (!a || !b) return false;
    const na = this.normalizeOCR(a);
    const nb = this.normalizeOCR(b);
    if (na.includes(nb) || nb.includes(na)) return true;
    const score = this.similarity(na, nb);
    return score >= threshold;
  }
  getShipId(objA, objBList) {
    const shipName = objA?.data?.shipin ?? null;
    const shipIMO = objA?.data?.shipinimo ?? null;
    let bestScore = 0;
    let bestId = 0;
    // 1️⃣ buscar por nombre
    if (shipName) {
      for (const ship of objBList) {
        const name = ship?.data?.name;
        if (!name) continue;
        const score = this.similarity(
          this.normalizeOCR(shipName),
          this.normalizeOCR(name)
        );
        if (score > bestScore && score > 0.75) {
          bestScore = score;
          bestId = ship.id;
        }
      }
      if (bestId !== 0) return bestId;
    }
    // 2️⃣ fallback por IMO
    if (shipIMO) {
      for (const ship of objBList) {
        const imo = ship?.data?.imo;
        if (!imo) continue;
        if (this.fuzzyMatch(shipIMO, imo, 0.9)) {
          return ship.id;
        }
      }
    }
    return 0;
  }

  shipList: any[] = [];
  getShip() {
    this.shipService.getAll().subscribe(resp => {
      this.shipList = resp;
      console.log('shipList',this.shipList);
    });
  }

  getShipNameById(id: number | null | undefined): string {
    if (id == null) return 'Sin nombre';
    const cco = this.shipList.find(c => Number(c.id) === Number(id));
    const nombre = cco?.data?.name;
    return typeof nombre === 'string' && nombre.trim() !== ''
      ? nombre
      : 'Sin Nombre';
  }

  onShipSelect(ev: any) {
    const selectedId = ev.detail.value;
    const selectedShip = this.shipList.find(s => s.id === selectedId);
    console.log('ID seleccionado =>', selectedId);
    console.log('Ship seleccionado =>', selectedShip);
    this.movement.data.ship=selectedId;
  }




}




