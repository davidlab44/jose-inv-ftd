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
import { TService } from '../../../../services/mnt/t.service';
import { StgService } from '../../../../services/mnt/stg.service';
import { AtsService } from '../../../../services/ats/ats.service';
import { MntService } from '../../../../services/mnt/mnt.service';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

  showSearchbar: boolean;
  storedObject: any;
  filteredProductList: any[] = [];
  stgList: any[] = [];
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
    private TService: TService,
    private stgService: StgService,
    private atsService: AtsService,
    private mntService: MntService,
  ) {}
  ngOnInit() {}
  hash:string='';
  atsList:any[]=[];
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
    this.loadAtss();
    this.loadStgs();
    this.loadMnt();
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

  discoverPendingOrExpired(id_cco: number): boolean {
    return this.stgList.some((it) => it.id_cco === id_cco && it.state === 'pending');
  }

  discoverLastMnt(id_cco: number): any {
    console.log('discoverLatMnt',id_cco)
    const listos = this.stgList.filter((it) => it.id_cco === id_cco && it.id_ats === 30);
    if (listos.length > 0) {
      const ultimo = listos.sort(
        (a, b) => new Date(b.data.dateapv).getTime() - new Date(a.data.dateapv).getTime()
      )[0];
      return ultimo;
    }
    return null;
  }

  loadMnt(){
    this.mntService.getAll().subscribe({
      next: (data) => {
        this.mntList = data || [];
        console.log('mntList', this.mntList);
      },
      error: (err) => {
        console.error('load_mntlist_error:', err);
      }
    });
  }


  loadStgs(){
    this.stgService.getAll().subscribe({
      next: (data) => {
        this.stgList = data || [];
        console.log('stgList', this.stgList);
      },
      error: (err) => {
        console.error('load_stglist_error:', err);
      }
    });
  }

  loadAtss(){
    this.atsService.getAll().subscribe({
      next: (data) => {
        this.atsList = data || [];
        console.log('atsList', this.atsList);
      },
      error: (err) => {
        console.error('load_atslist_error:', err);
      }
    });
  }




  async post() {
    if(this.isotanq1.id_cco>0&&this.isotanq2.id_cco==0){
      console.log('esta seguro que desea enviar un solo tanque?')     
      if(this.isotanq1.in.length>1){
        this.isotanq1.out=this.getDate();
      }else{
        this.isotanq1.in=this.getDate();
      }
      this.postRequest(this.isotanq1);
    }
    if(this.isotanq1.id_cco&&this.isotanq1.id_cco>0&&this.isotanq2.id_cco&&this.isotanq2.id_cco>0){
      //console.log("todo en orden, enviando los dos tanques")
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
    }
    //this.notifyUser();i// no borrar 
  }

  mntList:any[]=[];
  atsDataList:any[]=[];
  postRequest(data:any){
    console.log('io res data pasada',data)
    this.ioService.post(data).subscribe({
      next:(res)=>{
        console.log('io res',res)
        //if(this.atsList?.length==0){this.utilService.presentToast('No atsList','danger',500); return;}
        this.triggerMnt(res[0].data.id_cco);

      },
      error:(err)=>{
        console.error('error',err)
      }
    })   
  }

  triggerMnt(id_cco:number){
    console.log('id_cco  en triggermnt',id_cco) 
    console.log('mntList en trigger mnt  (todavia no se ha creado ningun mnt)',this.mntList)
    //const filteredMntLista = this.mntList?.filter(it => it?.data.id_cco === id_cco);
    //console.log('filteredMntLista ',filteredMntLista)
    //let orderedMntList = filteredMntLista?.sort((a, b) => b.i - a.i)[0];
    const mnt = this.mntList?.filter(it => it?.data.id_cco === id_cco).sort((a, b) => b.i - a.i)[0];
    //console.log('orderedMntList ',orderedMntList)
    console.log('mnt despues de todos los filtros ',mnt)
    //el metodo mas importante (dispara la creacion de mantenimiento )
    if(mnt===undefined||mnt.state==='done'||mnt?.length===0){
      this.postMnt(mnt,id_cco);
    }else{
      console.log('mnt no se puede crear ')
    }
  }

  postMnt(mnt:any,id_cco:number){
    console.log('post Mnt!!')
    const data={
      id_cco:id_cco,
      status:'created',
    }
    this.mntService.post(data).subscribe({
      next:res=>{
       console.log('mnt_service post',res);
       this.postTasks(res,id_cco);
      },
      error:err=>console.error('postMnt err',err)
    })
  }

  postTasks(mnt:any,id_cco:number){
    if(this.atsList?.length==0){this.utilService.presentToast('No atsList','danger',500); return;}
    console.log('ats list',this.atsList);
    this.atsDataList = this.atsList.map((it) => ({
      id_ats: it.i,
      id_mnt: mnt[0].i,
      ini: [],
      end: [],
      apv: [],
    })); 
    console.log('Lo que se enviara en el atsDataList',this.atsDataList)
    this.TService.postDataListStrgth(this.atsDataList).subscribe({
      next:(res)=>{
        console.log('mnt_t insert response',res)
      },
      error:(stgerr)=>{
        console.error('mnt_t insert err ',stgerr) 
      }
    })
  }


}




