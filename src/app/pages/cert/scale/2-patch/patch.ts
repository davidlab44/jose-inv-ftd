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
import { Cco,CcoMap } from '../../../../interfaces/cco';

@Component({
  selector: 'page-patch',
  templateUrl: 'patch.html',
  styleUrls: ['./patch.scss'],
})
export class PatchPage {

 withdrawnList: any[] = [];
  fullWithdrawnList: any[] = [];
  dayRange = {
    lower: 1,
    upper: this.getTodayDayOfYear()
  };
  startDay = 1;
  endDay = this.dayRange.upper;

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
  bucket:string | null = environment.s3aws;
  movement:any;
  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;

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
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.item) {
      this.movement = navigation.extras.state.item;
      this.uploadedUrl=this.movement.data.imgscale;
    } else {
      // Si recargaron la página, puedes cargar el item desde un servicio o API
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibidox:", this.movement);
  }

  ngOnInit() {
    this.form = this.fb.group({
      id: [this.movement?.id ?? null],
      container: [this.movement?.container ?? 'NA'],
      container2: [this.movement?.container2 ?? 'NA'],
      wticket: [this.movement?.data?.wticket ?? 0], 
      wgross: [this.movement?.data?.wgross ?? 0], 
      wtare: [this.movement?.data?.wtare ?? 0], 
      wnet: [this.movement?.data?.wnet ?? 0], 
    });
    this.initDefaultRange(4);
    this.loadCcos();
  }

  ionViewWillEnter() {
    this.form.patchValue({
      id: [this.movement?.id ?? null],
      wticket: [this.movement?.data?.wticket ?? 0], 
      container: [this.movement?.data?.container ?? 'NA'], 
      container2: [this.movement?.data?.container2 ?? 'NA'], 
      wgross: [this.movement?.data?.wgross ?? 0], 
      wtare: [this.movement?.data?.wtare ?? 0], 
      wnet: [this.movement?.data?.wnet ?? 0], 
    });
    this.getAll();
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      container: 0,
      container2: 0,
      wticket: 0,
      wgross: 0,
      wtare: 0,
      wnet: 0,
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
        //  lanzar OCR cuando la URL esté disponible
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
    this.ocrService.postScale(url).subscribe({
      next: (res) => {
        this.ocrResponse = res;
        console.log('OCR Response:', res);
        //  PASO 1: resolver IDs de contenedores
        this.resolveContainersFromOCR();
        //  PASO 2: opcional → setear en movement (debug / trazabilidad)
        this.movement.data.container_id = this.container1;
        this.movement.data.container2_id = this.container2;
        const normalizedDate = this.normalizeOCRDate(res?.data?.date);
        this.movement.data = {
          ...this.movement.data,
          container: res?.data?.container ?? '',
          container2: res?.data?.container2 ?? '',
          wticket: Number(res?.data?.wticket ?? 0),
          wgross: Number(res?.data?.wgross ?? 0),
          wtare: Number(res?.data?.wtare ?? 0),
          wnet: Number(res?.data?.wnet ?? 0),
        };
        this.form.patchValue({
          container: res?.data?.container ?? '',
          container2: res?.data?.container2 ?? '',
          wticket: Number(res?.data?.wticket ?? 0),
          wgross: Number(res?.data?.wgross ?? 0),
          wtare: Number(res?.data?.wtare ?? 0),
          wnet: Number(res?.data?.wnet ?? 0),
        });
        //console.log("movement actualizado:", this.movement);
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
      container: f.container ?? 'no-existe',
      container2: f.container2 ?? 'no-existe',
      wticket: Number(f.wticket ?? 0),
      wgross: Number(f.wgross ?? 0),
      wtare: Number(f.wtare ?? 0),
      wnet: Number(f.wnet ?? 0),
    };
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

  normalizeContainer(container: string): string | null {
    if (!container || typeof container !== 'string') return null;
    const clean = container.trim().toUpperCase();
    if (clean.length !== 11) return null;
    const prefix = clean.slice(0, 4);   // TCSU
    const numbers = clean.slice(4);     // 5000141
    if (!/^\d{7}$/.test(numbers)) return null;
    const formatted = `${prefix} ${numbers.slice(0, 6)}-${numbers.slice(6)}`;
    return formatted; // TCSU 500014-1
  }

  findCcoIdByContainer(containerFormatted: string): number {
    if (!containerFormatted) return 0;
    const match = this.ccoList.find(cco => {
      const name = (cco?.data?.name || '').toUpperCase().trim();
      return name === containerFormatted;
    });
    return match ? Number(match.id) : 0;
  }

  container1:number=0;
  container2:number=0;
  resolveContainersFromOCR(): void {
    console.log("==== RESOLVE CONTAINERS START ====");
    const c1_raw = this.ocrResponse?.data?.container;
    const c2_raw = this.ocrResponse?.data?.container2;
    console.log("[OCR RAW]", { c1_raw, c2_raw });
    // 🔧 normalizar
    const c1_fmt = this.normalizeContainer(c1_raw);
    const c2_fmt = this.normalizeContainer(c2_raw);
    console.log("[FORMATTED]", { c1_fmt, c2_fmt });
    // 🔍 buscar IDs
    this.container1 = c1_fmt ? this.findCcoIdByContainer(c1_fmt) : 0;
    this.container2 = c2_fmt ? this.findCcoIdByContainer(c2_fmt) : 0;
    console.log("[RESULT IDS]", {
      container1: this.container1,
      container2: this.container2
    });
    console.log("==== RESOLVE CONTAINERS END ====");
  }

  getTodayDayOfYear(): number {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff =
      today.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - today.getTimezoneOffset()) * 60 * 1000;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  stateFilteredList:any[]=[];
  getAll() {
    //const since = this.dayOfYearToISO(this.startDay);
    const since = '2026-04-24T05:00:00'; 
    const until = this.dayOfYearToISO(this.endDay, true);
    /*console.log("[INPUT] startDay:", this.startDay);*/
    /*console.log("[INPUT] endDay:", this.endDay);*/
    /*console.log("[CALCULATED] since:", since);*/
    /*console.log("[CALCULATED] until:", until);*/
    this.withdrawnService.getIntervalByAdate(since, until).subscribe({
      next: response => {
        this.withdrawnList = response;
        //console.log('withdrawnList',response)
        this.stateFilteredList=this.getInAndPlexaStateMovements(this.withdrawnList);
        console.log("withdrawnList response",this.stateFilteredList)
      }
    });
  }

  getInAndPlexaStateMovements(withdrawnList: any[]) {
    if (!Array.isArray(withdrawnList)) return [];
    return withdrawnList.filter(item => {
      const state = (item?.state || '').toString().trim().toLowerCase();
      return state === 'in' || state === 'plexa';
    });
  }

  dayOfYearToISO(day: number, endOfDay = false): string {
    const year = 2026;
    const date = new Date(year, 0);
    date.setDate(day);
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString().slice(0, 19);
  }

  initDefaultRange(days: number) {
    const today = this.getTodayDayOfYear();
    this.dayRange = {
      lower: Math.max(1, today - days),
      upper: today
    };
  }

  ccoList: Cco[] = [];
  ccoMap: CcoMap = {};

  loadCcos() {
    this.ccoService.getAll().subscribe({
      next: (ccos) => {
        this.ccoList = ccos;
        this.ccoMap = this.buildCcoMap(ccos);
        console.log(' ccoMap =>', this.ccoMap);
        //console.log(' ccoMap keys =>', Object.keys(this.ccoMap));
        //this.cd.markForCheck();
        // debug cruzado
        this.debugCcoMapping();
      },
      error: (err) => console.error('❌ Error loading ccos', err)
    });
  }


  debugCcoMapping() {
    //console.log(' DEBUG withdrawn -> ccoMap');
    this.filteredList.slice(0, 10).forEach((item, i) => {
      const ccoId = item?.data?.name;
      //console.log(`🔎 item[${i}] ccoId =>`, ccoId, 'tipo:', typeof ccoId);
      const cco = this.ccoMap[ccoId];
      if (!cco) {
        console.warn(` NO MATCH para ccoId=${ccoId}`, {
          availableKeys: Object.keys(this.ccoMap)
        });
      } else {
        console.log(` MATCH ccoId=${ccoId} =>`, cco);
      }
    });
  }

  searchTerm: string = ''; 
  get filteredList() {
    if (!this.searchTerm) return this.fullWithdrawnList;
    const term = this.searchTerm.toLowerCase();
    return this.fullWithdrawnList.filter(item =>
      Object.values(item.data).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }

  private buildCcoMap(ccoList: Cco[]): CcoMap {
    const map: CcoMap = {};
    ccoList.forEach((cco, index) => {
      const id = Number(cco.id);
      //console.log(` cco[${index}] id(normalizado) =>`, id, typeof id);
      map[id] = {
        name: cco.data?.name ?? 'N/A',
        color: cco.data?.color ?? '#ccc'
      };
    });
    return map;
  }

  joinTwins(): { current: any, twin: any | null } {
    const c1 = Number(this.container1) || 0;
    const c2 = Number(this.container2) || 0;
    console.log("[JOIN] container1:", c1, "container2:", c2);
    //  buscar registro actual
    const current = this.stateFilteredList.find(item =>
      Number(item?.data?.name) === c1
    );
    if (!current) {
      console.warn("[JOIN] current NOT FOUND");
      return { current: null, twin: null };
    }
    //  buscar twin
    let twin = null;
    if (c2 > 0) {
      twin = this.stateFilteredList.find(item =>
        Number(item?.data?.name) === c2
      );
    }
    console.log("[JOIN RESULT]", { current, twin });
    return { current, twin };
  }

  calculateDiff(): { updates: any[] } {
    console.log("==== CALCULATE DIFF START ====");
    const { current, twin } = this.joinTwins();
    if (!current) return { updates: [] };
    const kg1 = Number(current?.data?.kg) || 0;
    const wnet = Number(this.ocrResponse?.data?.wnet) || 0;
    let updates: any[] = [];
    //  SIN twin
    if (!twin) {
      const diff = kg1 - wnet;
      current.data.diff = diff;
      current.data.twin = 0;
      console.log("[NO TWIN] diff:", diff);
      updates.push(current);
      return { updates };
    }
    //  CON twin
    const kg2 = Number(twin?.data?.kg) || 0;
    const totalKg = kg1 + kg2;
    const diff = totalKg - wnet;
    console.log("[WITH TWIN]", { kg1, kg2, totalKg, wnet, diff });
    // asignar en ambos
    current.data.diff = diff;
    twin.data.diff = diff;
    current.data.twin = twin.id;
    twin.data.twin = current.id;
    updates.push(current, twin);
    return { updates };
  }

  patch() {
    this.updateMovementFromForm();
    this.movement.data.imgscale = this.uploadedUrl;
    const { updates } = this.calculateDiff();
    if (!updates.length) {
      console.warn("[PATCH] No updates");
      return;
    }
    console.log("[PATCH UPDATES]", updates);
    //  múltiples requests
    const requests = updates.map(item => {
      const payload = { ...item.data };
      console.log("[PATCH ITEM]", item.id, payload);
      return this.withdrawnService.patch(item.id, payload);
    });
    // ejecutar en paralelo
    Promise.all(requests.map(r => r.toPromise()))
      .then(responses => {
        console.log("[PATCH OK]", responses);
        this.utilService.presentToast("Actualizado correctamente","success",1000);
        this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'], { replaceUrl: true });
      })
      .catch(err => {
        console.error("[PATCH ERROR]", err);
      });
  }



}




