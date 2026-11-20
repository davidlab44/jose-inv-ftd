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
import { Cco,CcoMap } from '../../../../interfaces/cco';

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
  ocrSuccess: boolean = false;


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
      this.uploadedUrl = this.movement.data.imgin;
      this.uiDate=this.movement.data.datein;
    } else {
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibido shipin patch:", this.movement);
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      deliveryin: [''],
      datein: [''],
      tripin: [''],
      shipin: [null],
    });
  }


/*  initForm() {*/
    /*this.form = this.fb.group({*/
      /*id: [null],*/
      /*deliveryin: [''],*/
      /*datein: [''],*/
      /*tripin: [''],*/
      /*shipin: [0],*/
    /*});*/
  /*}*/



  ionViewWillEnter() {
    this.form.patchValue({
      id: this.movement?.id ?? null,
      deliveryin: this.movement?.data?.deliveryin ?? '',
      datein: this.movement?.data?.datein ?? '',
      tripin: this.movement?.data?.tripin ?? '',
      shipin: this.movement?.data?.shipin != null
        ? Number(this.movement.data.shipin)
        : null,
    });
    this.getShip();
    this.loadCcos();
    this.getAllCco();
  }


  /*ionViewWillEnter() {*/
    /*this.form.patchValue({*/
      /*id: this.movement?.id ?? null,*/
      /*deliveryin: this.movement?.data?.deliveryin ?? '',*/
      /*datein: this.movement?.data?.datein ?? '',*/
      /*tripin: this.movement?.data?.tripin ?? '',*/
      /*shipin: this.movement?.data?.shipin ?? null,*/
    /*});*/
    /*this.getShip();*/
    /*this.loadCcos();         */
    /*this.getAllCco();*/
  /*}*/

  resetForm(): void {
    this.uploadedUrl=''; 
    this.form.reset({
      id: 0,
      deliveryin: '',
      datein: '',
      tripin: '',
      shipin: '',
    });
    this.uploadProgress = 0; 
    this.uploadedUrl= null;
    //this.uploading = false;
  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){}

  prodrexList:any[]=[];
  ionViewDidEnter() {}

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
  //uploading = false;

  /*async takePhotoAndUpload() {*/
    /*this.uploading = true;*/
    /*this.uploadProgress = 0;*/
    /*this.uploadedUrl = null;*/
    /*const base64Image = await this.photoService.takePicture();*/
    /*if (!base64Image) {*/
      /*this.uploading = false;*/
      /*console.error('No se pudo obtener la imagen');*/
      /*return;*/
    /*}*/
    /*const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');*/
    /*progress$.subscribe({*/
      /*next: (p) => this.uploadProgress = p,*/
      /*error: (err) => {*/
        /*console.error('Error subiendo imagen', err);*/
        /*this.uploading = false;*/
      /*}*/
    /*});*/
    /*url$.subscribe({*/
      /*next: (url) => {*/
        /*this.uploadedUrl = url;*/
        /*this.launchOcr(url);*/
      /*},*/
      /*error: (err) => {*/
        /*console.error('Error obteniendo URL', err);*/
      /*},*/
      /*complete: () => {*/
        /*this.uploading = false;*/
      /*}*/
    /*});*/
  /*}*/

  /*async pickImageAndUpload() {*/
    /*this.uploading = true;*/
    /*this.uploadProgress = 0;*/
    /*this.uploadedUrl = null;*/
    /*const base64Image = await this.photoService.pickImage();*/
    /*if (!base64Image) {*/
      /*this.uploading = false;*/
      /*return;*/
    /*}*/
    /*const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');*/
    /*progress$.subscribe(p => this.uploadProgress = p);*/
    /*url$.subscribe({*/
      /*next: (url) => {*/
        /*this.uploadedUrl = url;*/
        /*this.launchOcr(url);*/
      /*},*/
      /*error: (err) => {*/
        /*console.error('Error upload', err);*/
        /*this.uploading = false;*/
      /*},*/
      /*complete: () => {*/
        /*this.uploading = false;*/
      /*}*/
    /*});*/
  /*}*/

  rawImage:string | null=null;
  contenedores:any[]=[];
  shipId:number=0;
  shipNombreEsp:string | null=null;
  //uiDate:any='2000-01-01T00:01:00';
  launchOcr(url: string) {
    console.time('PROCESS');
    this.startTimer1();
    this.ocrSuccess=true;
    this.rawImage=url;
    this.postImage(this.rawImage)
    this.ocrService.postIn(url).subscribe({
      next: (res) => {
        this.stopTimer1();
        this.ocrSuccess=false;
        console.log('ocrResponse:', res);
        console.timeEnd('PROCESS');
        this.contenedores=res.data.contenedores;
        if(this.contenedores[0]&&this.contenedores[0].length>0){
          const hasOne = this.thersIsSomeCCoLikeThis(res.data.contenedores[0])
          console.log("hasOne",hasOne)
          if(hasOne){
            this.ccoName="TCSU "+res.data.contenedores[0];
            this.movement.data.name=this.ccoService.getIdByName(this.ccoName);     
          }
        }else{
          this.utilService.presentToast('no se reconocieron isotanques','danger',500);
        }
        console.log('res 4 abb:', res.data.tripin.slice(0,2).toUpperCase());
        console.log('abb obtenida del trip:', res.data.tripin.slice(0,2).toUpperCase());
        console.log('are equals:',  this.shipList[2].data.abb===res.data.tripin.slice(0,2).toUpperCase());
        console.log('are equals:', res.data.tripin.slice(0,2).toUpperCase()==this.shipList[2].data.abb);
        //const shipin=this.shipService.findShipByAbbreviation(this.shipList,res.data.tripin.slice(0,2).toUpperCase()); 

        this.movement.data = {
          ...this.movement.data,
          deliveryin: res?.data?.deliveryin ?? '',
          datein: res?.data?.datein ?? '',
          tripin: res?.data?.tripin ?? '',
          shipin: this.movement.data.shipin ?? '',
        };
        console.log('movement antes de patch', this.movement.data)
        this.form.patchValue({
          deliveryin: res?.data?.deliveryin ?? '',
          datein: res?.data?.datein ?? '',
          tripin: res?.data?.tripin ?? '',
        });

        const hash=this.extractShipName(res.data.shipin);
        const shipin=this.shipService.findBestShipId(hash,this.shipList)

        console.log("ship obtenido",shipin)
        if(!shipin){
          this.utilService.presentToast('Ingrese el barco manualmente','primary',1500)
          return;
        }
        if(shipin>0){
          this.movement.data.shipin=shipin
          console.log('shipinId1',this.movement.data.shipin)
          this.shipNombreEsp=this.getShipNameById(this.movement.data.shipin)
          const normalizedDate = this.normalizeOCRDate(res?.data?.date);
          console.log('movement antes de patch', this.movement.data)
          this.form.patchValue({
            shipin: this.getShipNameById(this.movement.data.shipin) ?? 'Unable',
          });
          console.log("movement actualizado:", this.movement);
          this.uiDate=res.data.datein;
        }else{
          console.log('shipinIdELSE',shipin)
        }
      },
      error: (err) => {
        console.error('Error OCR:', err);
      }
    });
  }

  thersIsSomeCCoLikeThis(ccoNamehash:string):boolean{ //esto hace la comparación contra la fuente de verdad
    return (this.ccoList||[]).some(item=>
      (item?.data?.name||'').match(/\d+-\d+$/)?.[0]===ccoNamehash
    );
  }

  patch() {
    console.log('movement en el patch ', this.movement)
    this.movement.data.imgin = this.uploadedUrl;
    this.movement.data.datein=this.uiDate;
    this.movement.data.tripin=this.form.value.tripin;
    this.movement.data.deliveryin=this.form.value.deliveryin;
    if(!this.ccoName&&this.ccoName.length<2){this.utilService.presentToast('revise isotanque','danger'); return;}
    const payload = {...this.movement.data};
    console.log('uploadedUrl',this.uploadedUrl)
    payload.imgin=this.uploadedUrl;
    console.log("payload to patch =>", payload);
    this.withdrawnService.patch(this.movement.id, payload).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
        this.resetForm();
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

  shipList: any[] = [];
  getShip() {
    this.shipService.getAll().subscribe(resp => {
      this.shipList = resp;
      console.log('shipList',this.shipList);
/*      this.form.patchValue({*/
        /*shipin: this.getShipNameById(this.movement.data.shipin) ?? null,*/
      /*});*/
      this.shipNombreEsp=this.getShipNameById(this.movement.data.shipin)
    });
  }

  getShipNameById(id: number | null | undefined): string {
    if (id == null) return 'Sin nombre';
    const cco = this.shipList.find(c => Number(c.id) === Number(id));
    const nombre = cco?.data?.name;
    return typeof nombre === 'string' && nombre.trim() !== ''
      ? nombre
      : '';
  }

  onShipSelect(ev: any) {
    const selectedId = ev.detail.value;
    const selectedShip = this.shipList.find(s => s.id === selectedId);
    console.log('Ship seleccionado =>', selectedShip);
    this.movement.data.shipin=selectedId;
    this.shipNombreEsp=this.getShipNameById(this.movement.data.shipin);
    //this.shipId=selectedId;
  }

  onCcoSearch(text: string) {
    console.log('text to search',text)
    this.applyFilter(text);  
  }  
  applyFilter(text: string) {
    if (!text || text.trim() === '') {
      this.filteredList = this.ccoList;
      return;
    }
    const search = text.trim().toLowerCase();
    this.filteredList = this.ccoList.filter(item => {
      const name = (item?.data?.name || '').toLowerCase();

      return name.includes(search);
    });
    console.log('filteredList', this.filteredList);
  }
  ccoList:any[]=[];          
  ccoMap:CcoMap={};                
  loadCcos() {               
    this.ccoService.load().subscribe({
      next:(map)=>{
        this.ccoMap=map;     
        this.ccoService.debugMapping(this.filteredList);
        this.ccoName = this.ccoService.getName2(this.movement.data.name)
      },    
      error:(err)=>{
        console.error('Error loading ccos',err); 
      }     
    });     
  }   
  filteredList: any[] = [];     //lista filtrada
  getAllCco(){
    this.ccoService.getAll().subscribe({
      next: (response: any[]) => {
        console.log('cco List', response);
        this.ccoList = response;
      },
      error: (err: any) => {
        console.error('Error cargando CCO', err);
      }
    });
  }
  ccoName: string  | null=null;   // nombre a mostrar
  selectCco(item: any) {
    this.cco = item;
    //this.ccoName = item.data.name;
    this.movement.data.name = item.id;
    //actualizar movement (muy importante en tu flujo)
    console.log('item pasado:', item);
    this.ccoName=this.getCcoNameById(item.id);
    this.filteredList=[];
  }
  cco:any;  
  isotanq:any;
  ccos: any[] = []; 
  loadCco() {                
    this.ccoService.getAll().subscribe({ 
      next: (res) => {       
        console.log('Cco:', res);    
        this.ccos = res;
      }, 
      error: (err) => {      
        console.error(' Error al cargar cco:', err); 
      } 
    }); 
  } 
  getCcoNameById(id:number):string{
    const name= this.ccoService.getName2(id);
    console.log("name obtenido",name)
    return name;
  }

  private timerId: any = null;
  startTimer1(): void {
    this.stopTimer1();
    let seconds = 89;
    console.log('1:29');
    this.timerId = setInterval(() => {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      console.log(`${minutes}:${secs.toString().padStart(2, '0')}`);
      if (seconds === 0) {
        this.stopTimer1();
        return;
      }
      seconds--;
    }, 1000);
  }
  stopTimer1(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  extractShipName(text: string): string {
    return text?.replace(/^IMO\s+\d+\s*/i, '').trim() ?? '';
  }


  async takePhotoAndUpload(): Promise<void> {                                                                                                       
      //if (this.uploading) return;
      //this.uploading = true;
      try {
        const base64Image = await this.photoService.takePicture();
        if (!base64Image) {
          //this.uploading = false;
          return;
        }
        this.launchOcr(base64Image);
      } catch (error) {
        console.error('Error capturando imagen:', error);
        //this.uploading = false;
      }
    }
    
    /*launchOcr(base64Image: string): void {*/
      /*console.time('OCR_PROCESS');*/
      /*console.log('Base64 length:', base64Image.length);*/
      /*console.log('Base64 prefix:', base64Image.substring(0, 30));*/
      /*this.ocrService.postIn(base64Image).subscribe({*/
        /*next: (response) => {*/
          /*console.timeEnd('OCR_PROCESS');*/
          /*console.log('OCR JSON COMPLETO:', response);*/
        /*},*/
        /*error: (error) => {*/
          /*console.timeEnd('OCR_PROCESS');*/
          /*console.error('OCR ERROR:', {*/
            /*status: error.status,*/
            /*message: error.message,*/
            /*response: error.error*/
          /*});*/
        /*}*/
      /*});*/
    /*}*/
      

  async postImage(image:any) {
    const base64Image = image;
    if (!base64Image) {
      //this.uploading = false;
      console.error('No se pudo obtener la imagen');
      return;
    }
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');
    progress$.subscribe({
      next: (p) => this.uploadProgress = p,
      error: (err) => {
        console.error('Error subiendo imagen', err);
        //this.uploading = false;
      }
    });
    url$.subscribe({
      next: (url) => {
        this.uploadedUrl = url;
      },
      error: (err) => {
        console.error('Error obteniendo URL', err);
      },
      complete: () => {
        //this.uploading = false;
      }
    });
  }



  uiDate:any='2011-11-11T11:11:11.776966-05:00'; 
  //uiDate:any=this.localDateTime(new Date());
  maxDate = this.localDateTime(new Date());
  minDate = this.getMinDate();
  years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  datePickerOpen = false;
  pendingDate = this.uiDate;


  toDateTimeValue(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
  }
  localDateTime(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
  getMinDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear()-2);
    return this.localDateTime(date);
  }
  get selectedYear(): number { return Number((this.pendingDate || '').slice(0, 4)); }
  changeYear(event: any): void {
    const year = Number(event?.detail?.value);
    if (!this.years.includes(year)) return;
    const date = new Date(this.pendingDate);
    if (Number.isNaN(date.getTime())) return;
    const day = date.getDate();
    date.setDate(1);
    date.setFullYear(year);
    date.setDate(Math.min(day, new Date(year, date.getMonth()+1, 0).getDate()));
    const value = this.localDateTime(date);
    this.pendingDate = value < this.minDate ? this.minDate : value > this.maxDate ? this.maxDate : value;
  }
  openDatePicker(): void {
    this.maxDate = this.localDateTime(new Date());
    this.minDate = this.getMinDate();
    this.years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
    const value = this.toDateTimeValue(this.uiDate);
    const date = value ? this.localDateTime(new Date(value)) : this.maxDate;
    this.pendingDate = date < this.minDate ? this.minDate : date > this.maxDate ? this.maxDate : date;
    this.datePickerOpen = true;
  }
  closeDatePicker(): void { this.datePickerOpen = false; }
  onPendingDateChange(event: any): void {
    const value = event?.detail?.value;
    if (typeof value === 'string' && value) {
      this.pendingDate = value < this.minDate ? this.minDate : value > this.maxDate ? this.maxDate : value;
    }
  }
  confirmDatePicker(): void {
    this.onChange({ detail: { value: this.pendingDate } });
    this.closeDatePicker();
  }
  onChange(event: any): void {
    const value = event?.detail?.value;
    if (typeof value !== 'string' || !value) return;
    this.uiDate = value;
    this.movement.data.datein = value;
    this.form?.patchValue({ datein: value });
  }

  /*closeDatePicker*/
  /*onChange(event: any) {*/
    /*console.log(event.detail.value);*/
    /*this.uiDate=event.detail.value;*/
    /*this.movement.data.datein=event.detail.value;*/
  /*}*/

  async pickImageAndUpload(): Promise<void> {
    //if (this.uploading) return;
    //this.uploading = true;   
    try {   
      const base64Image = await this.photoService.pickImage();
      if (!base64Image) {    
        //this.uploading = false;
        return;
      }     
      this.launchOcr(base64Image);  
    } catch (error) {        
      console.error('Error seleccionando imagen:', error);
      //this.uploading = false;
    } 
  }   
          

}




