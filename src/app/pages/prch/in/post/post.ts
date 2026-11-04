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
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { AllocService } from '../../../../services/replenishment/alloc.service';
import { Withdrawn, WithdrawnData, createDefaultWithdrawn } from '../../../../interfaces/product';
import { ShipService } from '../../../../services/logistic/ship.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { CcoService } from '../../../../services/cc/cco.service';

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
  storedObject: any;
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any
  activeSession: Session | null = null;
  sessionId: number | null = null;
  searchSubject = new Subject<string>();
  searchCcoSubject = new Subject<string>(); 
  todayDate:any;
  form!: FormGroup;
  replenishmentList: any[] = [];
  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;
  shipId:any;

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
    private shipService : ShipService,
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
      datein: [''],
      deliveryin: [''],
      tripin: [''],
      shipin: [''],
    });
    const ahora = new Date();
    //this.todayDate=this.formatFechaLatam(ahora);
    //this.displayLast()
    this.searchCcoSubject.pipe( 
      debounceTime(300), 
      distinctUntilChanged()
    ).subscribe(text => {  
      this.applyFilter(text);
    });

  }

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300
  };

  updateSchedule(){}

  ionViewWillEnter() {
    this.getShip(); 
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
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'prch');
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
    const { progress$, url$ } = this.photoService.uploadBase64Image(base64Image,'prch');
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
  shipNombreEsp:string | null; 
  vendorDate:any='2000-01-01T00:01:00'; 
  launchOcr(url:string){
    this.ocrService.postIn(url).subscribe({
      next: (res) => {
        console.log('ocr response',res)
        this.ocrResponse=res;
        this.shipId=this.getShipId(res);
        console.log('contenedores extraidos',res.data.contenedores)
        this.ccoName=res.data.contenedores[0];
        if(res.data.contenedores[1]){
          this.cco2Name=res.data.contenedores[1];
        }
        this.ccoId=this.ccoService.getIdByName(this.ccoName);     
        console.log('name:', this.ccoName);
        console.log('id:', this.ccoId);
        console.log('OCR Response:', this.ocrResponse);
        console.log('ocrResponse.data:', this.ocrResponse.data);
        console.log('shipId:', this.shipId);
        if(this.shipId>0){
          console.log('shipId',this.shipId)
          this.shipNombreEsp=this.getShipNameById(this.shipId);
          console.log('shipNombreEsp',this.shipNombreEsp)
          this.shipNombreEsp=this.getShipNameById(this.shipId);
        }else{
          this.shipNombreEsp='Seleccionar'
        }
        this.updateUi();
        this.vendorDate=this.ocrResponse.data.date;
      },
      error: (err) => {
        console.error('Error OCR:', err);
      }
    });
  }

  updateUi(){
    const data = this.ocrResponse.data;
    const normalizedDate = this.normalizeOCRDate(data.date);
    this.form.patchValue({
      datein: data.datein ?? null,
      deliveryin: data.deliveryin ?? null,
      tripin: data.tripin ?? null,
      shipin: data.shipin ?? null,
    });
    //this.isotanq = this.validateIsotanqName(data.isotanq, this.ccos);
  }

  post() {
    const formData: Partial<WithdrawnData> = this.form.value;
    const withdrawn: Withdrawn = createDefaultWithdrawn();
    withdrawn.data = {
      ...withdrawn.data,
      ...formData,
    };
    withdrawn.data.shipin=this.shipId
    withdrawn.data.imgin=this.uploadedUrl;
    withdrawn.data.id_replenishment_product=1;
    let payload = withdrawn.data;
    payload.name= this.ccoId;
    console.log("payload to post =>", payload);
    this.withdrawnService.post(payload).subscribe({
      next: (response) => {
        console.log("Withdrawn post response", response);
        this.utilService.presentToast("registro actualizado exitosamente","success",1000);
        this.setWithdrawnState(response[0]?.id,'in');
        console.log('typeOf',typeof(this.ocrResponse.data.contenedores))
        if(this.ocrResponse.data.contenedores[1].length>0){
          console.log('contenedores',this.ocrResponse.data.contenedores)
          console.log('contenedores last',this.ocrResponse.data.contenedores[1])
          const container2Id=this.ccoService.getIdByName(this.ocrResponse.data.contenedores[1])
          console.log('container2id', container2Id);
          if(container2Id&&container2Id>0){
            this.cloneWithdrawn(response[0].id,payload,container2Id);
          }else{
            console.log('SOLO SE ENCONTRO UN CONTENEDOR!')
            //this.utilService.presentToast('') 
          }
        }else{

        }
      },
      error: (err) => {
        console.error("Withdrawn post error", err);
      }
    });
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



  /*  -------  ship --------- */  
  shipList: any[] = [];
  shipMap: Record<string, number> = {};
  imoMap: Record<string, number> = {};
  idMap: Record<number, any> = {};
  getShip() {
    this.shipService.getAll().subscribe(res => {
      console.log("respouesta res",res)
      this.shipList=res;
      this.buildShipMaps(res);
      console.log('shipMap', this.shipMap);
      console.log('imoMap', this.imoMap);
    });
  }
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

  getShipNameById(id: number | null | undefined): string {
    if (id == null) return 'Sin nombre';
    const ship = this.idMap[id];
    const name = ship?.data?.name;
    return name?.trim() ? name : 'Sin Nombre';
  }

  onShipSelect(ev: any) {
    const selectedId = ev.detail.value;
    const selectedShip = this.idMap[selectedId];
    console.log('ID seleccionado =>', selectedId);
    console.log('Ship seleccionado =>', selectedShip);
    this.shipId=selectedId;
  }
  
  onSearch(text: string) { 
    this.searchSubject.next(text);  
  } 

/* ---------end ship ----------*/




  /*---- CCO------ */
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
  ionViewDidEnter() {        
    this.resetForm();
    this.loadCcos();         
    //this.getAllPrices();     
    this.getAllCco();
  }
  ccoMap:CcoMap={};                
  loadCcos() {               
    this.ccoService.load().subscribe({
      next:(map)=>{
        this.ccoMap=map;     
        this.ccoService.debugMapping(this.filteredList);
        console.log('ccoMap', this.ccoMap)
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
  ccoName: string = '';   // nombre a mostrar
  ccoId: number = 0;   // id cco seleccionado a mostrar
  selectCco(item: any) {
    this.cco = item;
    this.ccoName = item.data.name;
    this.ccoId = item.id;
    //actualizar movement (muy importante en tu flujo)
    console.log('item pasado:', item);
    console.log('cco name:', this.ccoName);
    console.log('cco id:', this.ccoId);
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
    this.cco2 = item;
    this.cco2Name = item.data.name;
    this.cco2Id = item.id;
    //actualizar movement (muy importante en tu flujo)
    console.log('item pasado cco2:', item);
    console.log('cco2 name:', this.cco2Name);
    console.log('cco2 id :', this.cco2Id);
  }
  cco2:any;  
  isotanq2:any;



















  /*onShipSelect(e:any){}*/
  /*shipList:any[]=[];*/
/*------clone-------*/

 async  cloneWithdrawn(idCont1:number,item: any,contenedor2Id) {
    console.log("idCont1 pasado para clonar:", idCont1);
    console.log("item pasado para clonar:", item);
    console.log("contenedor2Id pasado para clonar:", contenedor2Id);
    //chatgpt => agregar al payload en data.twin el item.id
    //const payload = this.buildClonePayload(idCont1,item,contenedor2Id);
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

  /*buildClonePayload(idCont1:number,item: any,container2Id): any {*/
    /*//  Soporta tanto data plano como data.data (por si hay registros viejos mal guardados)*/
    /*const d = item?.data?.data ?? item?.data ?? {};*/
    /*return {*/
      /*ext_id: null,*/
      /*// ⚠️ Puedes cambiar esto a new Date().toISOString() si quieres que sea "nuevo"*/
      /*created_at: item.created_at,*/
      /*updated_at: item.created_at,*/
      /*data: {*/
        /*// RESET*/
        /*kg: 0,*/
        /*img: "",*/
        /*psi: 0,*/
        /*date: d.date ?? null,*/
        /*name: container2Id,*/
        /*seal: [],*/
        /*twin: idCont1,*/
        /*id_replenishment_product: 0,*/
        /*price: 0,*/
        /*imgin: null,*/
        /*shipin: 0,*/
        /*ticket: "",*/
        /*tripin: "",*/
        /*vendor: 0,*/
        /*datein: "",*/
        /*// MANTENER w**/
        /*wnet: d.wnet ?? 0,*/
        /*wtare: d.wtare ?? 0,*/
        /*wgross: d.wgross ?? 0,*/
        /*wticket: d.wticket ?? 0,*/
        /*// MANTENER *out*/
        /*imgout: d.imgout ?? null,*/
        /*dateout: d.dateout ?? null,*/
        /*shipout: d.shipout ?? 0,*/
        /*tripout: d.tripout ?? "",*/
        /*deliveryout: d.deliveryout ?? 0,*/
        /*// OTROS*/
        /*imgscale: d.imgscale ?? null,*/
        /*rotogate: 0,*/
        /*deliveryin: 0*/
      /*},*/
      /*refdate: null,*/
      /*state: "pre-in"*/
    /*};*/
  /*}*/

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

  onChange(event: any) {
      console.log(event.detail.value);
  }


}




