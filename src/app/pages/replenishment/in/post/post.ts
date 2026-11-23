import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config, isPlatform } from '@ionic/angular';
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
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})

export class PostPage {

  ios: boolean = isPlatform('ios');
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
  ocrResponse:any;
  withdrawnList:any[]=[];
  movement: any = {
   data:{
    name:0
   },
   data2:{
     name:0
   }
  };
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
  ) {}

  searchCcoSubject = new Subject<string>(); 
  hash:string='';
  table:any
  rexDocument:any;
  item:any;
  ngOnInit() {
    this.movement.date='2026'
    console.log('fake movement',this.movement)
    const nav = history.state;
    this.item = nav.item;
    this.withdrawnList = nav.list;
    this.form = this.fb.group({
      datein: [''],
      deliveryin: [''],
      cco: [''],
      tripin: [''],
      shipin: [''],
    });
    const ahora = new Date();
    this.searchCcoSubject.pipe( 
      debounceTime(300), 
      distinctUntilChanged()
    ).subscribe(text => {  
      this.applyFilter(text);
    });
  }

  ionViewWillEnter() {
    this.form.patchValue({
      deliveryin: '',
      datein: '',
      cco: '',
      tripin: '',
      shipin: '',
    });
    this.getShip();
    this.loadCcos();         
    this.getAllCco();
  }

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

  updateSchedule(){}

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


  rawImage:string | null=null;
  shipId:number=0;
  shipNombreEsp:string | null =null;
  uiDate:any='2011-11-11T11:11:11.776966-05:00';
  //uiDate:any=this.localDateTime(new Date());
  maxDate = this.localDateTime(new Date());
  minDate = this.getMinDate();
  years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);
  datePickerOpen = false;
  pendingDate = this.uiDate;
  launchOcr(url: string) {
    console.time('PROCESS');
    this.startTimer1();
    this.ocrSuccess=true;
    this.rawImage=url;
    this.postImage(this.rawImage)
    this.ocrService.postIn(url).subscribe({
      next: (res) => {
        this.ocrSuccess=false;
        console.log('ocrResponse:', res);
        console.timeEnd('PROCESS');
        this.stopTimer1();
        this.ocrResponse=res.data;
        if(this.ocrResponse.contenedores[0]&&this.ocrResponse.contenedores[0].length>0){
          const hasOne = this.thersIsSomeCCoLikeThis(res.data.contenedores[0])
          console.log("hasOne",hasOne)
          if(hasOne){
            this.form.patchValue({
              cco:"TCSU "+res.data.contenedores[0]
            });
            this.movement.data.name=this.ccoService.getIdByName("TCSU "+res.data.contenedores[0]);
            this.ccoName4Search="TCSU "+res.data.contenedores[0];
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
          this.shipNombreEsp=this.getShipNameById(this.movement.data.shipin)
          const normalizedDate = this.normalizeOCRDate(res?.data?.date);
          console.log('movement antes de patch', this.movement.data)
          this.form.patchValue({
            shipin: this.getShipNameById(this.movement.data.shipin) ?? 'Unable',
          });
          console.log("movement actualizado:", this.movement);
          this.uiDate=this.toDateTimeValue(res.data.datein) || this.uiDate;
        }else{
          console.log('shipinIdELSE',shipin)
        }
        //this.stopTimer();
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
    console.log('Ship seleccionado =>', selectedShip);
    this.movement.data.shipin=selectedId;
    this.shipNombreEsp=this.getShipNameById(this.movement.data.shipin);
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
        //this.ccoName = this.ccoService.getName(this.movement.data.name)
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
  ccoName4Search: string | null=null;   
  selectCco(item: any) {
    this.cco = item;
    console.log('item pasado:', item);
    this.ccoName4Search=this.getCcoNameById(item.id);
    this.movement.data.name = item.id;
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

  getCcoNameById(id:number):string{
    const name= this.ccoService.getName2(id);
    console.log("name obtenido",name)
    return name;
  }

  updateUi(){
    const data = this.ocrResponse;
    const normalizedDate = this.normalizeOCRDate(data.date);
    this.form.patchValue({
      datein: data.datein ?? null,
      deliveryin: data.deliveryin ?? null,
      tripin: data.tripin ?? null,
      shipin: data.shipin ?? null,
    });
  }

  withdrawn:any;
  post() {
    const payload: Withdrawn = createDefaultWithdrawn();
    payload.data.shipin=this.movement.data.shipin;
    payload.data.name=this.movement.data.name;  
    payload.data.deliveryin=this.form.value.deliveryin;  
    payload.data.tripin=this.form.value.tripin;  
    payload.data.imgin=this.uploadedUrl;  
    payload.data.datein=this.uiDate;  
    console.log('payload',payload)
  
    if (!this.isValidMovementDate(payload.data.datein)) {
      this.utilService.presentToast('fecha / año no valido','danger',800)
      return;
    }

    this.withdrawnService.post(payload.data).subscribe({
      next: (response) => {
        console.log("post response", response);
        this.utilService.presentToast("registro actualizado exitosamente","success",1000);
        this.setWithdrawnState(response[0]?.id,'in');
        console.log('typeOf',typeof(this.ocrResponse.contenedores))
        if((this.ocrResponse?.contenedores?.[1]?.length ?? 0) > 0) {
          console.log('contenedores',this.ocrResponse.contenedores)
          const container2Id=this.ccoService.getIdByName(this.ocrResponse.contenedores[1])
          console.log('container2id', container2Id);
          if(container2Id&&container2Id>0){
            this.cloneWithdrawn(response[0].id,payload,container2Id);
          }else{
            console.log('container2id no valido')
          }
        }else{ 
          this.updateUi()
          this.utilService.presentToast("registro actualizado exitosamente","success",1000);  
          this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],{ replaceUrl: true });  
        }
      },
      error: (err) => {
        console.error("Withdrawn post error", err);
      }
    });
  }


  isValidMovementDate(value: any): boolean {
    if (typeof value !== 'string' || !value.trim()) return false; 
    const parsed = new Date(value); 
    return !Number.isNaN(parsed.getTime()) && parsed.getFullYear() > 2024; 
  }   
      


  setWithdrawnState(id:number,state:string){
    this.withdrawnService.updateWithdrawnState(id,state).subscribe({
      next: response => {
        console.log('Response from server:',response);
        this.updateUi();
        this.utilService.presentToast("state actualizado exitosamente","success",1000);  
        this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],{ replaceUrl: true });  
      },
      error: err => {
        console.error('Error updating state:', err);
      }
    });
  }

  shipMap: Record<string, number> = {};
  imoMap: Record<string, number> = {};
  idMap: Record<number, any> = {};
  buildShipMap(shipList: any[]): Record<string, number> {
    const map: Record<string, number> = {};
    for (let i = 0; i < shipList.length; i++) {
      const s = shipList[i];
      const name = s?.data?.name;
      if (name) map[name.trim().toUpperCase()] = s.id;
    }
    return map;
  }

  buildShipMaps(shipList: any[]) {
    const nameMap: Record<string, number> = {};
    const imoMap: Record<string, number> = {};
    const idMap: Record<number, any> = {};
    for (let i = 0; i < shipList.length; i++) {
      const s = shipList[i];
      const name = s?.data?.name;
      const imo  = s?.data?.imo;
      if (name) nameMap[this.normalize(name)] = s.id;
      if (imo)  imoMap[this.normalize(imo)]   = s.id;
      idMap[s.id] = s;
    }
    this.shipMap = nameMap;
    this.imoMap  = imoMap;
    this.idMap   = idMap;
    this.shipList = shipList; 
  }

  normalize(v: string): string {
    return v
      ?.toUpperCase()
      .replace(/\s+/g, '')   // quitarespacios
      .replace(/[^A-Z0-9]/g, '') // limpiar ruido OCR
      .trim();
  }

  ccoId: number = 0;   // id cco seleccionado a mostrar

  /*---- CCO2------ */
  filteredList2: any[] = [];     //lista filtrada
  onCco2Search(text: string) {
    console.log('text to search',text)
    this.applyFilter2(text);  
  }  
  applyFilter2(text: string) {
    if (!text || text.trim() === '') {
      this.filteredList2 = this.ccoList;
      return;
    }
    const search = text.trim().toLowerCase();
    this.filteredList2= this.ccoList.filter(item => {
      const name = (item?.data?.name || '').toLowerCase();

      return name.includes(search);
    });
    console.log('filteredList2', this.filteredList2);
    this.filteredList2=[];
  }
 
  cco2Name: string = '';   // nombre a mostrar
  cco2Id: number = 0;   // id cco seleccionado a mostrar
  select2Cco(item: any) {
    this.movement.data2.name = item.id;
    console.log('movement.data2 :', this.movement);
  }

 async  cloneWithdrawn(idCont1:number,item: any,contenedor2Id) {
    console.log("idCont1 pasado para clonar:", idCont1);
    console.log("item pasado para clonar:", item);
    console.log("contenedor2Id pasado para clonar:", contenedor2Id);
    item.name=contenedor2Id; 
    item.twin=idCont1; 
    const payload =item; 
    console.log("Payload a enviar:", payload);
    this.withdrawnService.post(payload).subscribe({
      next: (response) => {
        console.log("Clone creado", response);
        this.selfPatch(item,response[0].id);
      },
      error: (err) => {
        console.error("Error al clonar", err);
      }
    });
  }


  async selfPatch(item:any,twin:number) {
    console.log("item to selfpatch ",item)
    console.log("twin to selfpatch ",twin)
    item.twin=twin;
    this.withdrawnService.patch(item.id,item.data).subscribe({
      next: (response) => {
        console.log("Withdrawn selfpatch response", response);
        this.utilService.presentToast("movimiento actualizado",'success',500)
        this.updateUi();
        this.utilService.presentToast("state actualizado exitosamente","success",1000);  
        this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],{ replaceUrl: true }); 
      },
      error: (err) => {
        console.error("Withdrawn selfpatch error", err);
      }
    });
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

  async pickImageAndUpload(): Promise<void> {
    /*    if (this.uploading) return;*/
    /*this.uploading = true;*/
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




