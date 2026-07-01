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
      wticket: [this.movement?.data?.wticket ?? 0], 
      wgross: [this.movement?.data?.wgross ?? 0], 
      wtare: [this.movement?.data?.wtare ?? 0], 
      wnet: [this.movement?.data?.wnet ?? 0], 
    });
  }

  ionViewWillEnter() {
    this.form = this.fb.group({
      id: [this.movement?.id ?? null],
      wticket: [this.movement?.data?.wticket ?? 0], 
      wgross: [this.movement?.data?.wgross ?? 0], 
      wtare: [this.movement?.data?.wtare ?? 0], 
      wnet: [this.movement?.data?.wnet ?? 0], 
    });
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
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

  updateSchedule(){}

  prodrexList:any[]=[];
  movement2:any;
  ionViewDidEnter() {
    if(this.movement.data.twin && Number(this.movement.data.twin)>0){
      this.withdrawnService.getById(this.movement.data.twin).subscribe({
        next: res=> {
          console.log('twin consultado[0]',res[0])
          this.movement2=res[0];
        }
      })
    }
    /*this.prodrexService.getAll().subscribe({*/
      /*next: response=>{*/
        /*this.prodrexList=response;*/
        /*console.log("getProdRexList",response)*/
      /*}*/
    /*})*/


    this.loadCcos();                                                                                                                                
  }         
     

  ccoMap:CcoMap={};                
  loadCcos() {
    this.ccoService.load().subscribe({
      next:(map)=>{
        this.ccoMap=map;     
      },
      error:(err)=>{         
        console.error('Error loading ccos',err);
      }
    });
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
        // 👇 lanzar OCR cuando la URL esté disponible
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
  //isotanq2Name:string='';
  isotanq1Name:string='';
  isotanq1Id:number=0;
  launchOcr(url: string) {
    this.ocrService.postScale(url).subscribe({
      next: (res) => {
        this.ocrResponse = res;

        if(res.data.isotanques[0]){
          this.isotanq1Id=this.ccoService.getIdByName(res.data.isotanques[0]);
          this.isotanq1Name=this.ccoMap[this.isotanq1Id]?.name;
          console.log('isotanques[0]:', res.data.isotanques[0]);
        }
        const normalizedDate = this.normalizeOCRDate(res?.data?.date);
        const seals = res?.data?.seal ?? [];
        // actualizar movement
        this.movement.data = {
          ...this.movement.data,
          wticket: Number(res?.data?.wticket ?? 0),
          wgross: Number(res?.data?.wgross ?? 0),
          wtare: Number(res?.data?.wtare ?? 0),
          wnet: Number(res?.data?.wnet ?? 0),
        };
        this.form.patchValue({
          wticket: Number(res?.data?.wticket ?? 0),
          wgross: Number(res?.data?.wgross ?? 0),
          wtare: Number(res?.data?.wtare ?? 0),
          wnet: Number(res?.data?.wnet ?? 0),
        });
        console.log("movement actualizado:", this.movement);
      },
      error: (err) => {
        console.error('Error OCR:', err);
      }
    });
  }

  container1:any;
  container2:any;

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

  stateFilteredList:any[]=[];
 

  updateMovementFromForm() {
    const f = this.form.value;
    this.movement.data = {
      ...this.movement.data,
      wticket: Number(f.wticket ?? 0),
      wgross: Number(f.wgross ?? 0),
      wtare: Number(f.wtare ?? 0),
      wnet: Number(f.wnet ?? 0),
    };
  }



  twinId=0;
  patch() {
    this.updateMovementFromForm();
    this.movement.data.imgscale = this.uploadedUrl;
    const payload = { ...this.movement.data };
    console.log("payload to patch =>", payload);
    this.withdrawnService.patch(this.movement.id, payload).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
        this.twinId = Number(payload?.twin || 0);
        if (this.twinId < 1) {
          this.finishPatch();
          return;
        }
        console.log("twin id",this.twinId);
        console.log("id2 ",this.movement.data.twin);
        if(this.movement.data.twin!=this.twinId){
          this.utilService.presentToast('Pareja no coincide',"danger",1000);
          setTimeout(() => {this.utilService.presentToast('Revisar!', 'danger', 500)}, 1000);  
          return;
        }
        this.movement2.data.imgscale = this.uploadedUrl;
        this.movement2.data.wticket = this.movement.data.wticket;
        this.movement2.data.wgross = this.movement.data.wgross;
        this.movement2.data.wnet = this.movement.data.wnet;
        this.movement2.data.wtare = this.movement.data.wtare;
        this.withdrawnService.patch(this.movement2.id, this.movement2.data).subscribe({
          next: (response2) => {
            console.log("Twin patch response", response2);
            this.finishPatch();
          },
          error: (err) => {
            console.error("Twin patch error", err);
            this.utilService.presentToast("Error actualizando el movimiento twin", "danger", 1500);
          }
        });
      },
      error: (err) => {
        console.error("Withdrawn patch error", err);
        this.utilService.presentToast("Error actualizando el movimiento", "danger", 1500);
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

