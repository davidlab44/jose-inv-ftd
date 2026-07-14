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

export interface Cco {
  id: number;
  data: {
    name?: string;
    color?: string;
  };
}

export interface CcoMap {
  [key: number]: {
    name: string;
    color: string;
  };
}




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
  isotanq2Name:string=''; 
  isotanq2Id:number=0; 

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private utilService:UtilService,
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
      this.uploadedUrl = this.movement.data.imgout;
    } else {
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibido shipout patch:", this.movement);
  }

  ccoMap: CcoMap = {};
  ngOnInit() {
    this.initForm();
    this.ccoService.ccoMap$.subscribe(map => {
      this.ccoMap = map;
      console.log('ccoMap1',this.ccoMap)
    });

    if (!Object.keys(this.ccoService.getMap()).length) {
      this.ccoService.load().subscribe();
      console.log('loading ccos')
    }
  }

  initForm() {
    this.form = this.fb.group({
      id: [null],
      deliveryout: [''],
      dateout: [''],
      tripout: [''],
      shipout: [0],
    });
  }

  ionViewWillEnter() {
    this.form.patchValue({
      id: this.movement?.id ?? null,
      deliveryout: this.movement?.data?.deliveryout ?? '',
      dateout: this.movement?.data?.dateout ?? '',
      tripout: this.movement?.data?.tripout ?? '',
      shipout: this.movement?.data?.shipout ?? null,
    });
    this.getShip();
  }

  resetForm(): void {
    this.uploadedUrl='';
    this.form.reset({
      id: 0,
      deliveryout: 0,
      dateout: '',
      tripout: '',
      shipout: 0,
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

  updateSchedule(){}

  movement2:any;
  ionViewDidEnter() {
    //this.resetForm();
    if(this.movement.data.twin && Number(this.movement.data.twin)>0){
      this.withdrawnService.getById(this.movement.data.twin).subscribe({
        next: res=> {
          console.log('twin consultado[0]',res[0])
          this.movement2=res[0];
          this.isotanq2Id=this.movement2.data.name;
          this.isotanq2Name= this.ccoService.getName(this.isotanq2Id);
          console.log('isotanq2Id',this.isotanq2Id)
          console.log('isotanq2Name',this.isotanq2Name)
          console.log('ccomap en DidEnter', this.ccoService.getMap());

        }
      })
    }
  }

  onSearch(text: string) {
    /*this.searchSubject.next(text);*/
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
    this.ocrService.postOut(url).subscribe({
      next: (res) => {
        console.log('OCR Response:', res);
        this.shipId=this.getShipId(res,this.shipList);
        if(this.shipId>0){
          console.log('shipId',this.shipId)
          this.shipNombreEsp=this.getShipNameById(this.shipId);

          console.log('shipNombreEsp',this.shipNombreEsp)
          console.log('shipNombreEsp2',this.shipNombreEsp)
          this.shipNombreEsp=this.getShipNameById(this.shipId);
        }else{
          this.shipNombreEsp='Seleccionar'
        }
        const normalizedDate = this.normalizeOCRDate(res?.data?.date);
        this.movement.data = {
          ...this.movement.data,
          deliveryout: res?.data?.deliveryout ?? 0,
          dateout: res?.data.dateout ?? '',
          //tripout: res?.data?.tripout ?? '',
          tripout: 'TMSYP',
          shipout: 3,
        };
        this.form.patchValue({
          deliveryout: res?.data?.deliveryout ?? 0,
          dateout: res?.data?.dateout ?? '',
          tripout: 'TMSYP',
          shipout: 3,
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
      deliveryout: f.deliveryout ?? '',
      dateout: f.dateout ?? '',
      tripout: f.tripout ?? '',
      shipout: (f.shipout ?? 0),
    };
  }

  patch() {
    this.updateMovementFromForm();
    this.movement.data.imgout = this.uploadedUrl;
    const payload = {
      ...this.movement.data,
      shipout: 3 
    };
    console.log("payload to patch =>", payload);
    this.withdrawnService.patch(this.movement.id, payload).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
        const twinId = Number(payload?.twin || 0);
        console.log('twin id es:',twinId);
        if (twinId < 1) {
          this.finishPatch();
          return;
        }
        console.log('twin id es:',twinId);
        this.movement2.data.imgscale = this.uploadedUrl;
        this.movement2.data.dateout = this.movement.data.dateout;
        this.movement2.data.deliveryout = this.movement.data.deliveryout;
        this.movement2.data.tripout = this.movement.data.tripout;
        this.movement2.data.shipout = this.movement.data.shipout;
        console.log('movement2',this.movement2) 
        this.withdrawnService.patch(this.movement2.id, this.movement2.data).subscribe({
          next: (response2) => {
            console.log("Twin patch response", response2);
            this.finishPatch();
          },
          error: (err) => {
            console.error("Twin patch error", err);
            this.utilService.presentToast("Error actualizando el movimiento twin2", "danger", 1500);
          }
        });
      },
      error: (err) => {
        console.error("Withdrawn patch error", err);
      }
    });
  }

  private finishPatch() {
    this.resetForm();
    this.utilService.presentToast("Actualizado correctamente", "success", 1000);
    this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'], { replaceUrl: true });
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
  const shipName = objA?.data?.shipout ?? null;
  const shipIMO = objA?.data?.shipoutimo ?? null;
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


  goToTwins(){
    console.log('this.movement',this.movement)
    this.router.navigate(
      ['/app/tabs/replenishment-twin-getall'],
       {
         state:{
           withdrawn:this.movement
        }
      }
    );
  }


  



}




