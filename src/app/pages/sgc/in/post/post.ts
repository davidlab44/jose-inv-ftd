import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController,IonList,LoadingController,ModalController,ToastController,Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../../../interfaces/session';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
//import { ProdrexService } from '../../../../services/prodrex.service';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CcoService } from '../../../../services/cc/cco.service';
import { IoService } from '../../../../services/mnt/io.service';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

  showSearchbar: boolean;
  opportunities = [];
  storedObject: any;
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
  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;
  isoName = 'TCSU 500020-1';
  isoColor = '#d9d9d9';
  iso2Name = 'TCSU 500043-9';

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
    private dateService: DateService,
    private userService: UserService,
    //private fb: FormBuilder ,
    private ccoService: CcoService,
    private ioService: IoService,
  ) {}
  ngOnInit() {}
  hash:string='';
  
  productListCaos:any[]=[];
  ionViewWillEnter() {
    this.ccoService.getAll().subscribe({
      next: (data) => {
        this.productListCaos = data || [];
        this.filteredProductList = [];
        console.log('productListCaos', this.productListCaos);
      },
      error: (err) => {
        console.error('[SEARCH][ERROR] error cargando productListCaos:', err);
      }
    });
  }
  
  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;
    this.searchSubject.next(value);
    this.filteredProductList = this.searchProducts(value, this.productListCaos);
  }

  searchProducts(hash: string, productList: any[]): any[] {
    console.log('[SEARCH][6.2] lista recibida -> cantidad:', productList?.length ?? 0);
    const term = (hash || '').trim().toLowerCase();
    if (!term) {
      return [];
    }
    const matches = (productList || []).filter((product, index) => {
      const name = product?.data.name;
      console.log('elemento lista',productList)
      console.log('elemento product',product)
      console.log('elemento name',name)
      const validName = typeof name === 'string';
      const match = validName && name.toLowerCase().includes(term);
      if (match) {
        console.log(`[SEARCH][7] MATCH index=${index} name=`, name, 'producto=', product);
      }
      return match;
    });
    console.log('[SEARCH][8] coincidencias totales antes de limitar:', matches.length);
    const visibleResults = matches.slice(0, 20);
    return visibleResults;
  }

  postReq(data:any,r:number) {
    this.ioService.post(data).subscribe({
      next: (response) => {
        console.log("mnt=>in post response", response);
        if(response && response.length>0){
          //this.utilservice.presenttoast(response.tostring())
          //this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceurl: true });    
        }
      }
    });
  }

  post() {
    if(this.iso2Name.length<2){
      return;
    }
    const data={"id_isotq":this.isotanq1.id}
  }


  isotanq1:any;
  isotanq2:any;
  selectProduct(p){
  console.log('this.isotanq1?.data?.name.length',this.isotanq1?.data?.name.length)
   if(this.isotanq1?.data?.name){
     this.isotanq2 =p;
   }else{
     this.isotanq1=p;
   }
   console.log("isotanq1",this.isotanq1);
   console.log("isotanq2",this.isotanq2);
  this.filteredProductList=[] 


  }

}
