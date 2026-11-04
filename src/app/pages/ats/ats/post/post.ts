import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { ActivatedRoute } from '@angular/router'
import { UtilService } from '../../../../services/util.service';
import { CategoryService } from '../../../../services/category.service';
import { UmService } from '../../../../services/um.service';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
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
  stgList:any[]=[];
  fltStgList:any[]=[];
  hash:string='';
  //table:any
  subtaskList:any[]=[];
  filteredSubtaskList:any[]=[];
  selctSubtaskList:any[]=[];

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
    private utilService:UtilService,
    private categoryService:CategoryService,
    private umService:UmService,
    private dateService: DateService,
    private fb: FormBuilder ,
    private atsService: AtsService,
    private srcService: SrcService,
    private stgService: StgService,
  ) {}
  ngOnInit() {
    this.loadUms();
    this.loadStgs();
    this.form = this.fb.group({
      name: [''],
      um: [0],
    });
    const ahora = new Date();
  }
  
  updateSchedule(){}

  ionViewWillEnter() {
    this.srcService.getAll().subscribe({
      next: (data) => {
        this.subtaskList = data || [];
        console.log('subtask list:', this.subtaskList.length);
      },
      error: (err) => {
        console.error(' error cargando subtask:', err);
      }
    });
  }

  ionViewDidEnter() {}

  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;//para clear el cajon de texto
    this.searchSubject.next(value);
    this.filteredSubtaskList = this.subtaskList.filter(it=>it.data.name.toLowerCase().includes(text.toLowerCase()))
    //console.log('',this.filteredSubtaskList?.length ?? 0); NO BORRAR nuevo estandar
  }

  selectSubtask(p: any) {
    p.data.qty = 1;
    console.log('qty:', p.data.qty);
    console.log('p:', p);
    this.selctSubtaskList.push(p);
    console.log('selectedSubtaskList:', this.selctSubtaskList);
    this.filteredSubtaskList = [];
    this.hash='';
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
    this.selctSubtaskList = this.selctSubtaskList.filter(item=>item.id !== p.id)
  }

  removeStg(p:any) {
    this.selectStg =null;
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
 
  choosenStg:any;
  selectStg(p:any){
    p.data.qty=1;
    console.log('selectedStg',p);
    this.fltStgList=[];
    this.choosenStg=p;
  }

  guardar() {
    const data: any = this.form.value;
    data.src = this.selctSubtaskList.map(it => it.i);
    data.id_stg=this.choosenStg?.i;
    //delete data.category;  nuevo estandar NO_BORRAR
    console.log('task to post =>', data);
    this.atsService.post(data).subscribe({
      next: (response) => {
        console.log("ats post response", response);
        if(response && response.length>0){
          this.form.reset();
          this.hash='';
          this.hazh='';
          this.filteredSubtaskList=[];
          this.fltStgList=[];
          window.location.reload();
          //this.utilservice.presenttoast(response.tostring())
          //this.router.navigate(['/app/tabs/asset-supply-readprdct'],   { replaceurl: true });    
        }
      }
    });
  }


}
