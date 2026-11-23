import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { Session } from '../../interfaces/session';
import { UtilService } from '../../services/util.service';
import { ProductService } from '../../services/product.service';
import { Subject, forkJoin, of } from 'rxjs';
import { concatMap, finalize, take } from 'rxjs/operators';
import { RexService } from '../../services/rex.service';
import { ProdrexService } from '../../services/prodrex.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'page-prodrex',
  templateUrl: 'prodrex.html',
  styleUrls: ['./prodrex.scss'],
})

export class ProdrexPage {

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
  todayDate:any
  productListCaos:any[]=[];
  
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
    private rexService: RexService,
    private prodrexService: ProdrexService,
    private userService: UserService
  ) {

  }

  hash:string='';
  table:any
  rexDocument:any;
  async ngOnInit(){
  }

  loadingView = false;
  removingId: number | null = null;
  delivering = false;

  refreshView() {
    if (this.loadingView) return;
    this.loadingView = true;

    forkJoin({
      rex: this.rexService.getLast().pipe(take(1)),
      products: this.productService.getCachedOrServer().pipe(take(1))
    }).pipe(finalize(() => this.loadingView = false)).subscribe({
      next: ({ rex, products }) => {
        this.productListCaos = Array.isArray(products) ? products : [];
        if (Array.isArray(rex) && rex.length && rex[0].state === 'draft') {
          this.rexDocument = rex;
          this.getProdrexList();
        } else {
          this.rexDocument = [];
          this.utilService.presentToast('creando rex');
          this.rexService.addRex().pipe(take(1)).subscribe({
            next: () => {
              this.rexService.getLast().pipe(take(1)).subscribe({
                next: res => {
                  this.rexDocument = Array.isArray(res) ? res : [];
                  this.getProdrexList();
                },
                error: err => console.error('Error consultando rex:', err)
              });
            },
            error: err => console.error('Error creando rex:', err)
          });
        }
      },
      error: err => console.error('Error cargando vista prodrex:', err)
    });
  }

  userList:any[]=[];
  loadUsers(){
    this.userService.getAll().subscribe({
      next: (response)=>{
        console.log("users",response)
        this.userList=response;
      }
    })
  }

  ionViewWillEnter() {}

  ionViewDidEnter(){
    this.loadUsers();
    this.refreshView();
  }

  prodrexList:any[]=[];
  getProdrexList() {
    const rexId = this.rexDocument?.[0]?.id;
    if (rexId == null) {
      this.prodrexList = [];
      return;
    }
    this.prodrexService.getRecents().pipe(take(1)).subscribe({
      next: response => {
        const records = Array.isArray(response) ? response : [];
        this.prodrexList = records
          .filter(item => Number(item?.data?.id_rex) === Number(rexId))
          .map(item => ({ ...item, prdtname: this.getProductNameById(item?.data?.id_product) }));
      },
      error: err => console.error('Error consultando prodrex:', err)
    });
  }

  trackByProdrexId(index: number, item: any) {
    return item.id;
  }

  getProductNameById(id: number | string | null | undefined): string {
    if (id === null || id === undefined) return 'Sin Nombre 1';
    const idNum = Number(id);
    if (isNaN(idNum)) return 'Sin Nombre 2';
    if (!Array.isArray(this.productListCaos) || this.productListCaos.length === 0) {
      return 'Sin Nombre 3';
    }
    const product = this.productListCaos.find(p => Number(p.id) === idNum);
    if (!product) return 'Sin Nombre 4';
    const name = product?.data?.name;
    if (typeof name === 'string' && name.trim() !== '') {
      return name;
    }
    return 'Sin Nombre 5';
  }
  
  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  selectUsers(){
    console.log("userList",this.userList)    
    this.ownerId=0;
    this.hasOwner=false;
  }

  ownerId=0
  selectUser(u: any) {
    const rexId = this.rexDocument[0].id;
    this.rexService.addUserOwner(rexId, u.id).subscribe({
      next: (res) => {
        if (res?.length && res[0]?.data?.id_user > 0) {
          this.ownerId = res[0].data.id_user;
          this.hasOwner = true;
        }
      },
      error: err => console.error(err)
    });
  }

  removeFromProdrex(prdct: any) {
    if (this.removingId !== null || !prdct?.data || prdct.id == null) return;
    this.removingId = prdct.id;

    this.productService.getProductById(prdct.data.id_product).pipe(
      take(1),
      concatMap(products => {
        const product = Array.isArray(products) ? products[0] : null;
        if (!product?.data || product.id == null) {
          throw new Error('Producto no encontrado');
        }
        const qty = Number(product.data.qty);
        const returnedQty = Number(prdct.data.qty);
        if (!Number.isFinite(qty) || !Number.isFinite(returnedQty)) {
          throw new Error('Cantidad inválida');
        }
        const updatedData = { ...product.data, qty: qty + returnedQty };
        return this.productService.patch(product.id, updatedData).pipe(take(1));
      }),
      concatMap(() => this.prodrexService.removeFromProdrex(prdct.id).pipe(take(1))),
      finalize(() => this.removingId = null)
    ).subscribe({
      next: () => {
        this.prodrexList = this.prodrexList.filter(item => item.id !== prdct.id);
        // La lista se actualiza en memoria: no navegar ni recargar la página.
        // El servidor ya confirmó la eliminación del registro.
      },
      error: err => {
        console.error('Error eliminando prodrex:', err);
        this.utilService.presentToast('No se pudo completar la eliminación');
      }
    });
  }

  addToOrder(p){
    console.log('p',p)
  }

  markAsDelivered() {
    const rexId = this.rexDocument?.[0]?.id;
    if (this.delivering || this.removingId !== null || rexId == null) return;
    this.delivering = true;
    this.rexService.markAsDelivered(rexId, 'delivered').pipe(
      take(1),
      finalize(() => this.delivering = false)
    ).subscribe({
      next: () => this.router.navigate(['/app/tabs/schedule']).catch(err =>
        console.error('Error navegando a schedule:', err)
      ),
      error: err => {
        console.error('Error marcando entrega:', err);
        this.utilService.presentToast('No se pudo registrar la entrega');
      }
    });
  }

}




