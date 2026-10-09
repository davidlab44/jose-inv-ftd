import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController,IonList,LoadingController,ModalController,ToastController,Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../../../interfaces/session';
import { UtilService } from '../../../../services/util.service';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CcoService } from '../../../../services/cc/cco.service';
import { IoService } from '../../../../services/mnt/io.service';
//import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

  showSearchbar: boolean;
  storedObject: any;
  filteredProductList: any[] = [];
  queryText:any
  searchSubject = new Subject<string>();
  todayDate:any;

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
  isotanq1:any={"id_cco":0,"in":'',"out":""};
  isotanq2:any={"id_cco":0,"in":'',"out":""};
  iso1:any;
  iso2:any;

  selectProduct(p){
    console.log('this.isotanq1?.data?.name.length',this.isotanq1?.data?.name.length)
    if(this.isotanq1?.id_cco>0){
      this.iso2=p;
      this.isotanq2.id_cco =p.id;
    }else{
      this.isotanq1.id_cco=p.id;
      this.iso1=p;
    }
    console.log("isotanq1",this.isotanq1);
    console.log("isotanq2",this.isotanq2);
    this.filteredProductList=[] 
  }

  post() {
    if(this.isotanq1.id_cco>0&&this.isotanq2.id_cco==0){
      console.log('esta seguro que desea enviar un solo tanque?')     
      if(this.isotanq1.in.length>1){
        this.isotanq1.out=this.getDate();
      }else{
        this.isotanq1.in=this.getDate();
      }
      this.postRequest(this.isotanq1);
      this.notifyUser();
      return;
    }
    if(this.isotanq1.id_cco&&this.isotanq1.id_cco>0&&this.isotanq2.id_cco&&this.isotanq2.id_cco>0){
      console.log("todo en orden, enviando los dos tanques")
      if(this.isotanq1.in.length>1){
        this.isotanq1.out=this.getDate();
      }else{
        this.isotanq1.in=this.getDate();
      }     
      if(this.isotanq2.in.length>1){
        this.isotanq2.out=this.getDate();
      }else{
        this.isotanq2.in=this.getDate();
      }
      this.postRequest(this.isotanq1);
      this.postRequest(this.isotanq2);
      this.notifyUser();
      return;
    }
    return;
  }

  postRequest(data:any){
    this.ioService.post(data).subscribe({
      next:(res)=>{
        console.log('postRequest',res)
      },
      error:(err)=>{
        console.error('error',err)
      }
    })   
  }

  getDate(){
    const now = new Date();
    const dateNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
    console.log(dateNow);
    return dateNow;
  }

  notifyUser(){
    this.utilService.presentToast("Movimiento registrado",'success',500)
    //this.updateUi();
    this.utilService.presentToast("State actualizado exitosamente","success",1000);  
    this.router.navigate(['/app/tabs/sgc-in-getall'],{ replaceUrl: true }); 
  }


}
