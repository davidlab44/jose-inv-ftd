import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList,LoadingController,ModalController,ToastController,Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Session } from '../../../../interfaces/session';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { UmService } from '../../../../services/um.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PService } from '../../../../services/p/p.service';

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
  opportunities = [];
  storedObject: any;
  posOrders: any[] = [];
  posOrderLineList: any[] = [];
  pendingCommands: any[] = [];
  deliveredList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any
  activeSession: Session | null = null;
  sessionId: number | null = null;
  searchSubject = new Subject<string>();
  todayDate:any;
  form!: FormGroup;
  replenishmentList: any[] = [];
  uploadProgress = 0;
  images: string[] = [];
  selectedUsers: number[] = [];
  showMedia = false;
  saving = false;
  private subs = new Subscription();
  private productIndex: { product: any; name: string }[] = [];
  uploading = false;

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
    private productService:ProductService,
    private categoryService:CategoryService,
    private umService:UmService,
    private fb: FormBuilder ,
    private pService: PService,
  ) {

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.item) {
      this.rcv = navigation.extras.state.item;
      //this.uploadedUrl = this.movement.data.imgin;
      //this.uiDate=this.movement.data.datein;
    } else {
      console.warn('No se recibió item por NavigationExtras.state');
    }
    console.log("Item recibido:", this.rcv);

  }
  rcv:any;
  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {
    this.loadCategories();
    this.loadUms();
    this.form = this.fb.group({
      name: [''],
      um: [0],
    });
    const ahora = new Date();
    this.todayDate=this.formatFechaLatam(ahora);
    this.subs.add(this.searchSubject.pipe(debounceTime(180)).subscribe(value => {
      if (value === this.hash) this.filteredProductList = this.searchProducts(value);
    }));
  }
 
  lastAsset:any;
  displayLast() {
    this.productService.getAll().subscribe({
      next: (response) => {
        this.lastAsset = response.reduce((max, item) =>
          item.id > max.id ? item : max
        );
      }
    });
  }

  updateSchedule(){}

  productListCaos:any[]=[];
  ionViewWillEnter() {
    this.subs.add(this.productService.getCachedOrServer().subscribe({
      next: data => {
        this.productListCaos = data || [];
        this.productIndex = this.productListCaos.filter(p => typeof p?.data?.name === 'string')
          .map(product => ({ product, name: this.normalize(product.data.name) }));
        this.filteredProductList = this.searchProducts(this.hash);
      },
      error: err => console.error('Error cargando productos', err)
    }));
  }
  private normalize(value: string): string {
    return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  searchProducts(hash: string): any[] {
    const term = this.normalize(hash || '');
    const results: any[] = [];
    if (!term) return results;
    for (const entry of this.productIndex) {
      if (entry.name.includes(term)) results.push(entry.product);
      if (results.length === 20) break;
    }
    return results;
  }
  onSearch(text: string | null | undefined) {
    const value = text || '';
    if (value === this.hash) return;
    this.hash = value;
    this.filteredProductList = [];
    this.searchSubject.next(value);
  }
  trackProduct(index: number, p: any) { return p.id; }
  ngOnDestroy() { this.subs.unsubscribe(); this.searchSubject.complete(); }
  async selectUsers() {
    if (this.saving) return;
    const modal = await this.modalCtrl.create({ component: PostUsersModal,
      componentProps: { selected: [...this.selectedUsers] } });
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result.role === 'confirm') this.selectedUsers = result.data;
  }

  bomList:any[]=[];
  selectProduct(p: any) {
    p = { ...p, data: { ...p.data } };
    p.data.qty=1;
    p.data.categName=this.categoryService.getUmNameById(p.data.categ[0],this.categs);
    p.data.umName=this.umService.getUmNameById(p.data.um,this.ums);
    this.bomList.push(p)

    this.hash = '';
    this.searchSubject.next('');
    this.filteredProductList = [];
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
    if (horas === 0) horas = 12;
    const horasTexto = String(horas).padStart(2, '0');
    return `${fechaTexto} ${horasTexto}:${minutos}:${segundos} ${ampm}`;
  }

  categs: any[] = [];    
  loadCategories() { 
      this.categoryService.getAllCategories().subscribe({ 
        next: (res) => {       
          this.categs = res;          
          this.categoryService.saveCategoriesToLocal(res); // Guarda en localStorage 
        }, 
        error: (err) => {      
          console.error('❌ Error al cargar categorías:', err); 
        } 
      }); 
   }   
       
   ums: any[] = []; 
   loadUms() {                
     this.umService.getAllUms().subscribe({ 
        next: (res) => {       
          console.log('Ums unidades de medida :', res);    
          this.ums = res; 
          this.umService.saveUmsToLocal(res); 
        }, 
        error: (err) => {      
          console.error('Error al cargar categorías:', err); 
          this.ums = this.umService.getUmsFromLocal(); 
        } 
      }); 
   }     

  incrementQty(p: any, amount: number, event: Event) {
    event.stopPropagation();
    const currentQty = Number(p?.data?.qty) || 0;
    p.data.qty = currentQty + amount;
  }

  clearQty(p: any, event: Event) {
    event.stopPropagation();
    p.data.qty = 1;
  }

  removeById(p:any) {
    this.bomList = this.bomList.filter(item=>item.id !== p.id)
  }

  restartQty(p:any){
   p.data.qty=0;
   //console.log('TEST ESBUILD 001');
  }

  guardar() {
    if (this.uploading || this.saving) return;
    this.saving = true;
    const data: any = { ...this.form.value };
    data.img = [...this.images];
    data.usr = [...this.selectedUsers]; 
    data.bom= this.bomList.map(it=>it.i);
    //delete data.category;
    console.log('Project to post =>', data);
    this.pService.post(data).subscribe({
      next: (response) => {
        this.saving = false;
        if(response && response.length>0){
          this.bomList=[];
          this.form.reset({ name: '', um: 0 });
          this.images = [];
          this.selectedUsers = [];
          this.showMedia = false;
          this.utilService.presentToast('registro creado','success')
          //this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceurl: true });    
        }
      },
      error: () => { this.saving = false; this.utilService.presentToast('No se pudo guardar', 'danger'); },
      complete: () => { this.saving = false; }
    });
  }
}

@Component({ selector: 'post-users-modal', template: `
<ion-header><ion-toolbar><ion-title>Usuarios</ion-title><ion-buttons slot="end"><ion-button (click)="close()">Cancelar</ion-button></ion-buttons></ion-toolbar></ion-header>
<ion-content><ion-searchbar (ionInput)="filter($event.detail.value)"></ion-searchbar>
<ion-spinner *ngIf="loading"></ion-spinner><ion-text color="danger" *ngIf="error">{{error}}</ion-text>
<ion-list><ion-item *ngFor="let u of visible"><ion-label>{{label(u)}}</ion-label><ion-checkbox slot="end" [checked]="ids.has(+u.id)" (ionChange)="toggle(u.id,$event.detail.checked)"></ion-checkbox></ion-item></ion-list></ion-content>
<ion-footer><ion-toolbar><ion-button expand="block" (click)="confirm()" [disabled]="loading || !!error">Seleccionar ({{ids.size}})</ion-button></ion-toolbar></ion-footer>` })
export class PostUsersModal {
  selected: number[] = [];
  ids = new Set<number>();
  users: any[] = []; visible: any[] = []; loading = true; error = '';
  constructor(private usersService: UserService, private modal: ModalController) {}
  ngOnInit() {
    this.ids = new Set(this.selected);
    this.usersService.getAll().subscribe({ next: (rows: any[]) => {
      this.users = (rows || []).filter(u => Number.isInteger(Number(u.id)) && Number(u.id) > 0);
      this.visible = this.users; this.loading = false;
    }, error: () => { this.loading = false; this.error = 'No se pudieron cargar los usuarios'; } });
  }
  label(u: any): string { return String(u.data?.name || u.name || u.data?.email || u.email || ('Usuario #' + u.id)); }
  filter(value: string) { const q = (value || '').toLowerCase(); this.visible = this.users.filter(u => this.label(u).toLowerCase().includes(q)); }
  toggle(id: any, checked: boolean) { if (checked) this.ids.add(Number(id)); else this.ids.delete(Number(id)); }
  close() { this.modal.dismiss(null, 'cancel'); }
  confirm() { this.modal.dismiss(Array.from(this.ids), 'confirm'); }
}
