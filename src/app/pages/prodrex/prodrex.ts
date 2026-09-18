import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { Session } from '../../interfaces/session';
import { UtilService } from '../../services/util.service';
import { ProductService } from '../../services/product.service';
import { Subject } from 'rxjs';
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
    this.loadUsers();
  }

  hash:string='';
  table:any
  rexDocument:any;
  async ngOnInit(){
  }

  async refreshView() {
    this.rexService.getLast().subscribe({
      next: (response) => {
        this.getProdrexList();
        if(response && response.length && response.length>0){
          console.log('getLast RSPNS',response)
          if(response[0].state=='draft'){
            this.rexDocument=response;
            console.log('this.rexdocument',response)
          }else{
            this.utilService.presentToast('creando rex')
            this.rexService.addRex().subscribe({
              next: (r)=>{
                console.log('addRex response ',r)
                this.rexService.getLast().subscribe({
                  next: (res)=>{
                    console.log('getLast res response',res)
                  }
                })
              }
            })
          }
        }
      }
    })

    this.productService.getCachedOrServer().subscribe(data => {
      this.productListCaos = data;
      console.log('this.productListCaos',this.productListCaos)
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
    this.refreshView();
  }

  prodrexList:any[]=[];
  getProdrexList() {
    this.prodrexList=[];
    console.log('va a consultar prodrexservice')
    this.prodrexService.getRecents().subscribe({
      next: response=>{
        console.log('prodRexService',response);
        if(this.rexDocument.length && this.rexDocument.length>0){
          response.forEach(prodrex => {
            if(prodrex.data.id_rex==this.rexDocument[0].id){
              this.prodrexList.push(prodrex);
            }
          });
        }else{
          this.utilService.presentToast('rexDocument is empty')
        }
        this.mapProdrexList()
      }
    })
  }

  mapProdrexList(): void {
    console.log('prodrexLissss',this.prodrexList);
    this.prodrexList = this.prodrexList.map(item => ({
      ...item,
      prdtname: this.getProductNameById(item.data?.id_product)
    }));
    console.log('prodrexListtt',this.prodrexList);
  }

  getProductNameById(id: number | string | null | undefined): string {
    console.log("id product pasado",id);
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

  /*ownerId=0*/
  /*selectUser(u){*/
    /*console.log("component u pasado",u)*/
    /*console.log("rexDocument[0]",this.rexDocument)*/
    /*this.rexService.addUserOwner(this.rexDocument[0],u.id).subscribe({*/
      /*next: (res) =>{*/
        /*console.log("res para usar",res)*/
        /*if(res[0].data.id_user > 0){*/
          /*this.ownerId=res[0].data.id_user;*/
          /*this.hasOwner=true;*/
        /*} */
      /*}*/
    /*})*/
  /*}*/

  removeFromProdrex(prdct:any){
    this.productService.getProductById(prdct.data.id_product).subscribe({
      next: (r)=>{
        r[0].data.qty=Number(r[0].data.qty)+Number(prdct.data.qty);
        console.log('r[0]',r[0].data)
        this.productService.patch(r[0].id,r[0].data).subscribe({
          next: (r)=>{
            console.log('updated',r)
            this.prodrexService.removeFromProdrex(prdct.id).subscribe({
              next: (response)=>{
                console.log('prodrex deleted',response);
                this.prodrexService.getAll().subscribe({
                  next: response=>{
                    this.prodrexList=response;
                    console.log("getProdRexList",response)
                  }
                })
                this.rexService.getAll().subscribe({
                  next: (response) => {
                    this.rexDocument=response;
                    console.log("response rex table",response)
                  }
                })
              }
            });
          }
        })
      }
    })
  }

  addToOrder(p){
    console.log('p',p)
  }

  markAsDelivered(){
    this.rexService.markAsDelivered(this.rexDocument[0].id,'delivered').subscribe({
      next: (response)=>{
        console.log('markAsDelivered response',response)
        this.router.navigate(['/app/tabs/schedule']);
      }
    });
  }

}




