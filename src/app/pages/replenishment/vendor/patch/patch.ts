import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Session } from '../../../../interfaces/session';
import { UtilService } from '../../../../services/util.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhotoService } from '../../../../services/asset/photo.service';
import { OcrService } from '../../../../services/ai/ocr.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { GlppricesService } from '../../../../services/replenishment/glpprices.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { CalendarOptions } from '@fullcalendar/core'; 
import dayGridPlugin from '@fullcalendar/daygrid';

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
    private withdrawnService : WithdrawnService,
    private ccoService : CcoService,
    private glpPricesService: GlppricesService
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
      //price: [this.movement?.data?.price ?? 0], 
    });
    this.ccoName=this.ccoService.getName(this.movement.data.name); 
    this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(text => {
        this.applyFilter(text);
      });
     this.loadGlpPrice();
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
      //price: this.movement?.data?.price ?? 0
    });
  }

  resetForm(): void {
    this.uploadedUrl='';
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

  updateSchedule(){}

  ccoList:any[]=[];
  movement2:any;
  hasTwin:Boolean=false;
  ionViewDidEnter() {
    //this.resetForm();
    this.loadCcos();
    this.getAllPrices();
    this.getAllCco();   
  }

  ccoMap:CcoMap={};                
  loadCcos() {
    this.ccoService.load().subscribe({
      next:(map)=>{

        this.ccoMap=map;
        this.ccoService.debugMapping(this.filteredList);
        this.getCco2();

      },
      error:(err)=>{
        console.error('Error loading ccos',err);
      }
    });
  }

  getCco2(){
    if(this.movement.data.twin && Number(this.movement.data.twin)>0){
      this.hasTwin=true;
      this.withdrawnService.getById(this.movement.data.twin).subscribe({
        next: res=> {
          this.movement2=res[0];
          this.cco2Id=this.movement2.data.name;
          this.cco2Name=this.ccoMap[this.cco2Id]?.name;
        }
      })
    }  
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
    console.log('textNoprmalized',search);
    console.log('ccoList',this.ccoList);
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
        console.log('ocr response',res)
        this.ocrResponse = res;
        this.ccoName="TCSU "+res?.data?.isotanq;
        this.ccoId=this.ccoService.getIdByName(this.ccoName);     
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
      name: this.ccoName,
      ticket: f.ticket,
      kg: Number(f.kg),
      psi: Number(f.psi),
      rotogate: Number(f.rotogate),
      seal: [f.sello1, f.sello2, f.sello3].filter(Boolean)
    };
  }

  patch() {
    this.updateMovementFromForm();
    this.updateMovementFromForm();
    this.movement.data.img = this.uploadedUrl;
    const itemPrice = this.getGlpPriceItemByDate(this.movement.data.date, 1);
    console.log("itemPrice",itemPrice)
    if(itemPrice?.data) {
      const { price, cents } = itemPrice.data;
      this.movement.data.price = `${price}.${cents}`;
    }else {
      console.warn("No se encontró un precio válido para la fecha", this.movement.data.date);
      this.utilService.presentToast('Revise la fecha ingresada Año-mes-dia','danger',2000)
    }
    const cop = itemPrice.data.price;
    const cents = itemPrice.data.cents;
    this.movement.data.price=`${cop}.${cents}`;
    this.movement.data.id_replenishment_product=1;
    let payload = this.movement.data;
    payload.name = this.ccoId;
    console.log("payload to patch =>", payload);
    this.updateMovementFromForm();
    this.withdrawnService.patch(this.movement.id, payload).subscribe({
      next: (response) => {
        console.log("Withdrawn patch response", response);
        //this.utilService.presentToast("registro actualizado exitosamente","success",1000);
          //this.router.navigate(['/app/tabs/replenishment-withdrawn-getall'],   { replaceUrl: true });  
          const twinId = Number(payload?.twin || 0);
          if (twinId < 1) {
            this.finishPatch();
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
    if (this.movement?.data) {
      this.movement.data.name = item.id;
    }
    
    console.log('item pasado:', item);
    console.log('cco name:', this.ccoName);
    console.log('cco id:', this.ccoId);
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

  isImportedGlp(ev: any) {
    const checked = ev.detail.checked;
    if(checked>0){
      this.movement.data.id_replenishment_product = checked ? 2 : 1;
    }
    console.log('id_replenishment_product nuevo =>', this.movement.data.id_replenishment_product);
  }

  getAllPrices() {
    this.glpPricesService.getAll().subscribe({
      next: (response) => {
        this.glppricesList = response.slice().reverse();
        console.log("pricelist",this.glppricesList)
        //this.getMaxIdItem(this.glppricesList);
        //this.getMaxImportedItem(this.glppricesList);
      }
    });
  }
  //price:string='';
/*  getMaxIdItem(items: any[]) {*/
    /*console.log("paso por getMaxIdItem()")*/
    /*const filtered = items.filter(i => i.data?.id_replenishment_product === 1);*/
    /*//if (!filtered.length) return;*/
    /*this.lastGlpprice = filtered.reduce((max, item) =>*/
      /*item.id > max.id ? item : max*/
    /*);*/
    /*if (this.movement?.data?.id_replenishment_product == 1) {*/
      /*const price = Number(this.lastGlpprice.data.price) || 0;*/
      /*const cents = String(this.lastGlpprice.data.cents ?? 0).padStart(2, '0');*/
      /*this.price= `${price}.${cents}`*/
      /*console.log("priceen getMaxIdItem",this.price)*/
     /*[> this.form.patchValue({<]*/
        /*[>price: `${price}.${cents}`<]*/
      /*[>});<]*/
    /*}*/
  /*}*/
  /*  getMaxImportedItem(items: any[]) {*/
    /*const filtered = items.filter(i => i.data?.id_replenishment_product === 2);*/
    /*if (!filtered.length) return;*/
    /*this.lastImportedPrice = filtered.reduce((max, item) => item.id > max.id ? item : max);*/
    /*console.log("get ultimo precio imprtd",this.movement.data.id_replenishment_product)*/
    /*if (this.movement?.data?.id_replenishment_product == 2) {*/
        /*const price = Number(this.lastImportedPrice.data.price) || 0;*/
        /*const cents = String(this.lastImportedPrice.data.cents ?? 0).padStart(2, '0');*/
        /*this.form.patchValue({*/
          /*price: `${price}.${cents}`*/
        /*});*/
    /*}*/
  /*}*/


  /*--------price-----------*/
  glpPriceList: any[] = []; 
  loadGlpPrice() {              
     this.glpPricesService.getAll().subscribe({ 
        next: (res) => {       
          console.log('glpPrices',res);    
          this.glpPriceList = res;
        }, 
        error: (err) => {      
          console.error(' Error al cargar glpPrices:', err); 
        } 
      }); 
  } 

  getGlpPriceItemByDate(date:string,idReplenishmentProduct:number):any|null {
    console.log('getGlppriceItemByDate',date)
    console.log('getGlppriceItemByDate',idReplenishmentProduct)
    const target=new Date(date).getTime();
    for(const item of this.glpPriceList) {
      const data=item?.data;
      if(!data)
        continue;
      if(data.id_replenishment_product!==idReplenishmentProduct)
        continue;
      const init=new Date(data.init).getTime();
      const end=new Date(data.end).getTime();
      if(target>=init && target<=end)
        return item;
    }
    return null;
  }




}




