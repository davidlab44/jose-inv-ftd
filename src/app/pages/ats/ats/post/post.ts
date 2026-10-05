import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { ActivatedRoute } from '@angular/router'
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { CategoryService } from '../../../../services/category.service';
import { UmService } from '../../../../services/um.service';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
import { UserService } from '../../../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AtsService } from '../../../../services/ats/ats.service';
import { SrcService } from '../../../../services/ats/src.service';
import { StgService } from '../../../../services/mnt/stg.service';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

  searchSubject = new Subject<string>();
  stgSearchSubject = new Subject<string>();
  todayDate:any;
  form!: FormGroup;
  replenishmentList: any[] = [];
  fltStgList:any[]=[];

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private route: ActivatedRoute,
    private sessionService:SessionService,
    private utilService:UtilService,
    private productService:ProductService,
    private categoryService:CategoryService,
    private umService:UmService,
    private dateService: DateService,
    private fb: FormBuilder ,
    private atsService: AtsService,
    private srcService: SrcService,
    private stgService: StgService,
  ) {}

  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {
    this.loadUms();
    this.loadStgs();
    this.form = this.fb.group({
      name: [''],
      um: [0],
    });
    const ahora = new Date();
    //this.todayDate=this.formatFechaLatam(ahora);
    //this.displayLast();
  }

  guardar() {
    const data: any = this.form.value;
    //data.img = this.uploadedUrl; 
    data.bom= this.bomList;
    data.id_stg=this.id_stg;
    //delete data.category;
    console.log('Product to post =>', data);
    this.atsService.post(data).subscribe({
      next: (response) => {
        console.log("ats post response", response);
        if(response && response.length>0){
          //this.utilservice.presenttoast(response.tostring())
          //this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceurl: true });    
        }
      }
    });

  }

  updateSchedule(){}

  taskList:any[]=[];
  filteredTaskList:any[]=[];
  ionViewWillEnter() {
    this.srcService.getAll().subscribe({
      next: (data) => {
        this.taskList = data || [];
        this.filteredTaskList = [];
        console.log('task list:', this.taskList.length);
      },
      error: (err) => {
        console.error(' error cargando task:', err);
      }
    });
  }

  ionViewDidEnter() {}

  stgList:any[]=[];
  


  searchProducts(hash: string, productList: any[]): any[] {
    console.log('lista recibida -> cantidad:', productList?.length ?? 0);
/*    const term = (hash || '').trim().toLowerCase();*/
    /*if (!term) {*/
      /*return [];*/
    /*}*/
    /*const matches = (productList || []).filter((product, index) => {*/
      /*const name = product?.data.name;*/
      /*console.log('elemento lista',productList)*/
      /*console.log('elemento product',product)*/
      /*console.log('elemento name',name)*/
      /*const validName = typeof name === 'string';*/
      /*const match = validName && name.toLowerCase().includes(term);*/
      /*return match;*/
    /*});*/
    /*console.log('coincidencias totales antes de limitar:', matches.length);*/
    /*const visibleResults =f matches.slice(0, 20);*/
    /*return visibleResults;*/
    return [];
  }

  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;
    this.searchSubject.next(value);
    this.filteredTaskList = this.searchProducts(value, this.taskList);
  }

  bomList:any[]=[];
  selectProduct(p: any) {
    p.data.qty=1;
    this.bomList.push(p)
    console.log('bomlist',this.bomList)
    this.hash = p?.name ?? '';
    this.filteredTaskList = [];
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
   p.data.qty=1;
  }
  
  loadStgs() {
    this.stgService.getAll().subscribe({
      next: response=>{
        this.stgList=response;
        console.log("stgList",response)
        //this.fltStgList=this.stgList;
      }
    })
  }

  hazh:string='';
  onStgSearch(hash: string | null | undefined) {
    const value = hash ?? '';
    this.hazh=value;
    this.stgSearchSubject.next(value);
    this.fltStgList = this.stgList.filter(it=>it.data.name.includes(value));
    console.log('fltStgList',this.fltStgList)
  }
 
  id_stg:number|null=null;
  selectStg(p:any){
    console.log('selected',p);
    this.fltStgList=[];
    this.id_stg=p.id;
  }


}
