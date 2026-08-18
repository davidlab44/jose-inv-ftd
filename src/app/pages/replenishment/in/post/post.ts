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
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})

export class PostPage {

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
    this.uploading = false;
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
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');
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
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'fotos');
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

  contenedores:any[]=[];
  shipId:number=0;
  shipNombreEsp:string | null;
  uiDate:any='2000-01-01T00:01:00';;
  launchOcr(url: string) {
    console.time('PROCESS');
    this.ocrService.postIn(url).subscribe({
      next: (res) => {
        console.log('ocrResponse:', res);
        console.timeEnd('PROCESS');
        this.contenedores=res.data.contenedores;
        if(this.contenedores[0]&&this.contenedores[0].length>0){
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
        const shipin=this.shipService.findShipByAbbreviation(this.shipList,res.data.tripin.slice(0,2).toUpperCase()); 
        console.log("ship obtenido",shipin)
        if(!shipin){
          this.utilService.presentToast('Ingrese el barco manualmente','primary',1500)
          return;
        }
        if(shipin.id>0){
          this.movement.data.shipin=shipin.id
          this.shipNombreEsp=this.getShipNameById(this.movement.data.shipin)
          const normalizedDate = this.normalizeOCRDate(res?.data?.date);
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
            shipin: this.getShipNameById(this.movement.data.shipin) ?? 'Unable',
          });
          console.log("movement actualizado:", this.movement);
          this.uiDate=res.data.datein;
        }else{
          console.log('shipinIdELSE',shipin.id)
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


  /*post2() {*/
    /*console.log('movement en el post ', this.movement)*/
    /*//this.updateMovementFromForm();*/
    /*this.movement.data.imgin = this.uploadedUrl;*/
    /*this.movement.data.datein=this.uiDate;*/
    /*if(!this.ccoName&&this.ccoName.length<2){this.utilService.presentToast('revise isotanque','danger'); return;}*/
    /*//this.movement.data.name=this.ccoService.getIdByName(this.ccoName); */
    /*const payload = {...this.movement.data};*/
    /*console.log('uploadedUrl',this.uploadedUrl)*/
    /*payload.imgin=this.uploadedUrl;*/
    /*console.log("payload to patch =>", payload);*/
    /*this.withdrawnService.post(payload).subscribe({*/
      /*next: (response) => {*/
        /*console.log("Withdrawn patch response", response);*/
        /*this.resetForm();*/
        /*this.utilService.presentToast("registro actualizado exitosamente","success",1000);*/
        /*this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],   { replaceUrl: true });  */
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
    //this.shipId=selectedId;
  }

  /*[>---- CCO------ <]*/
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
  ccoName4Search: string = '';   
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

  onChange(event: any) {
      console.log(event.detail.value);
      this.uiDate=event.detail.value;
      this.movement.data.date=event.detail.value;
  }


  getCcoNameById(id:number):string{
    const name= this.ccoService.getName(id);
    console.log("name obtenido",name)
    return name;
  }

  /*updateUi(){*/
    /*const data = this.ocrResponse.data;*/
    /*const normalizedDate = this.normalizeOCRDate(data.date);*/
    /*this.form.patchValue({*/
      /*datein: data.datein ?? null,*/
      /*deliveryin: data.deliveryin ?? null,*/
      /*tripin: data.tripin ?? null,*/
      /*shipin: data.shipin ?? null,*/
    /*});*/
    /*//this.isotanq = this.validateIsotanqName(data.isotanq, this.ccos);*/
  /*}*/

  withdrawn:any;
  post() {



    const payload: Withdrawn = createDefaultWithdrawn();
    payload.data.shipin=this.movement.data.shipin;
    payload.data.name=this.movement.data.name;  
    payload.data.deliveryin=this.form.value.deliveryin;  
    payload.data.datein=this.uiDate;  
    console.log('payload',payload)
    /*this.withdrawnService.post(payload).subscribe({*/
      /*next: (response) => {*/
        /*console.log("Withdrawn post response", response);*/
        /*this.utilService.presentToast("registro actualizado exitosamente","success",1000);*/
        /*this.setWithdrawnState(response[0]?.id,'in');*/

        /*[>        console.log('typeOf',typeof(this.ocrResponse.data.contenedores))<]*/
        /*[>//if(this.ocrResponse.data.contenedores[1].length>0){<]*/
        /*[>if ((this.ocrResponse?.data?.contenedores?.[1]?.length ?? 0) > 0) {<]*/
          /*[>console.log('contenedores',this.ocrResponse.data.contenedores)<]*/
          /*[>const container2Id=this.ccoService.getIdByName(this.ocrResponse.data.contenedores[1])<]*/
          /*[>console.log('container2id', container2Id);<]*/
          /*[>if(container2Id&&container2Id>0){<]*/
            /*[>this.cloneWithdrawn(response[0].id,payload,container2Id);<]*/
          /*[>}else{<]*/
            /*[>console.log('SOLO SE ENCONTRO UN CONTENEDOR!')<]*/
            /*[>//this.utilService.presentToast('') <]*/
          /*[>}<]*/
        /*[>}else{ //no es necesario imprimir nada ya se imropimio <]*/
        /*[>}<]*/
      /*},*/
      /*error: (err) => {*/
        /*console.error("Withdrawn post error", err);*/
      /*}*/
    /*});*/




  }

  setWithdrawnState(id:number,state:string){
    this.withdrawnService.updateWithdrawnState(id,state).subscribe({
      next: response => {
        console.log('Response from server:',response);
        this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],{ replaceUrl: true });  
      },
      error: err => {
        console.error('Error updating state:', err);
      }
    });
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

  getShipId(res: any): number {
    console.log("🔎 getShipId input:", res);
    const shipName = res?.data?.shipin ?? null;
    const shipIMO  = res?.data?.shipinimo ?? null;
    console.log("➡️ shipName:", shipName, "shipIMO:", shipIMO);
    //  1. O(1) por nombre
    if (shipName) {

      const normName = this.normalize(shipName);
      //\ccconst normName = this.normalize(shipName);
      const id = this.shipMap[normName];
      console.log("🔹 O(1) name lookup:", normName, "=>", id);
      if (id) {
        console.log(" return by name O(1):", id);
        return id;
      }
    }
    //  2. O(1) por IMO
    if (shipIMO) {
      const normIMO = this.normalize(shipIMO);
      const id = this.imoMap[normIMO];
      console.log("🔹 O(1) IMO lookup:", normIMO, "=>", id);
      if (id) {
        console.log(" return by IMO O(1):", id);
        return id;
      }
    }
    // 3. Fuzzy SOLO si falla
    let bestScore = 0;
    let bestId = 0;
    if (shipName) {
      const normA = this.normalizeOCR(shipName);
      console.log("Fuzzy name start:", normA);
      for (const ship of this.shipList) {
        const name = ship?.data?.name;
        if (!name) continue;
        const score = this.similarity(normA, this.normalizeOCR(name));
        if (score > bestScore && score > 0.75) {
          bestScore = score;
          bestId = ship.id;
        }
      }
      console.log("🔸 best fuzzy name:", bestId, "score:", bestScore);
      if (bestId !== 0) {
        console.log(" return by fuzzy name:", bestId);
        return bestId;
      }
    }
    // 4. Fallback fuzzy IMO
    if (shipIMO) {
      console.log("🔸 Fuzzy IMO start:", shipIMO);
      let foundId = 0;
      for (const ship of this.shipList) {
        const imo = ship?.data?.imo;
        if (!imo) continue;
        if (this.fuzzyMatch(shipIMO, imo, 0.9)) {
          foundId = ship.id;
          break;
        }
      }
      console.log("🔸 fuzzy IMO result:", foundId);
      if (foundId) {
        console.log("return by fuzzy IMO:", foundId);
        return foundId;
      }
    }
    console.log("no match, return 0");
    return 0;
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
        //this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],   { replaceUrl: true });  
 
      },
      error: (err) => {
        console.error("Withdrawn selfpatch error", err);
      }
    });
  }







}




