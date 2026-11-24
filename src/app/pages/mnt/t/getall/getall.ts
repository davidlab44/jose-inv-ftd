import { Component, ViewChild, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Subject, Subscription } from 'rxjs';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { IoService } from '../../../../services/mnt/io.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { TService } from '../../../../services/mnt/t.service';
import { MntService } from '../../../../services/mnt/mnt.service';
import { StgService } from '../../../../services/mnt/stg.service';
import { AtsService } from '../../../../services/ats/ats.service';
import { DateService } from '../../../../services/local/date.service';
import { LctnService } from '../../../../services/logistic/lctn.service';

@Component({
  selector:'app-getall',
  templateUrl:'./getall.html',
  styleUrls:['./getall.scss'],
})

export class GetallPage implements OnInit {

  showSearchbar:boolean;
  searchSubject=new Subject<string>();
  searchTerm:string='';
  hash:string='';

  constructor(
    public alertCtrl:AlertController,
    public confData:ConferenceData,
    public loadingCtrl:LoadingController,
    public modalCtrl:ModalController,
    public router:Router,
    public toastCtrl:ToastController,
    public user:UserData,
    public config:Config,
    private menu: MenuController,
    private ioService: IoService,
    private ccoService: CcoService,
    private tService: TService,
    private mntService: MntService,
    private stgService: StgService,
    private atsService: AtsService,
    private dateService: DateService,
    private lctnService: LctnService,
  ) {}

  ionViewWillEnter() {
    this.loadTasks();
    this.loadCco();
    if (this.cco) this.getLocation(this.cco.id);
  }

  ionViewWillLeave() {
    this.locationSub?.unsubscribe();
  }

  ngOnInit() {}
  filteredCcoList:any[] =[];
  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;
    this.searchSubject.next(value);
    this.filteredCcoList = this.searchCco(value, this.ccoList);
  }

  searchCco(hash: string, list: any[]): any[] {
    console.log('lista recibida:', list?.length ?? 0);
    if(list?.length==0)
      return[];
    return list.filter((it)=>it.data.name.includes(hash));
  }

  ccoList: any[] = []; 
  loadCco(){                
    this.ccoService.getAll().subscribe({ 
      next: (res) => {      
        this.ccoList=res;
        console.log('ccoList :', res);   
        this.filteredCcoList=this.cco ? [] : this.searchCco(this.hash, this.ccoList);
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  tList: any[] = []; 
  fltrdTList: any[] = []; 
  loadTasks() {                
    this.tService.getAll().subscribe({ 
      next: (res) => {      
        this.tList=res;
        console.log('tList :', res);
        this.fltrdTList=[];
        this.loadMnt(); 
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  mntList: any[] = []; 
  loadMnt(){                
    this.mntService.getAll().subscribe({ 
      next: (res) => {      
        this.mntList=res;
        console.log('mntList :', res);   
        this.loadAts();
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  atsList: any[] = []; 
  loadAts(){                
    this.atsService.getAll().subscribe({ 
      next: (res) => {      
        this.atsList=res;
        console.log('atsList :', res);   
        this.loadStg();
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  stgList: any[] = []; 
  loadStg(){                
    this.stgService.getAll().subscribe({ 
      next: (res) => {      
        this.stgList=res;
        console.log('stgList :', res);   
        this.loadIo();
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  insideWorkshopIds = new Set<number>();
  ioList: any[] = []; 
  loadIo(){                
    this.ioService.getAll().subscribe({ 
      next: (res) => {      
        this.ioList=res;
        console.log('ioList :', res);   
        this.builTaskFullList();
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  builTaskFullList(){
    // Último movimiento por contenedor (id_cco).
    const latestIoByCco = new Map<number, any>();
    this.ioList.forEach((io) => {
      const ccoId = Number(io?.data?.id_cco);
      if (!Number.isFinite(ccoId)) return;
      const previous = latestIoByCco.get(ccoId);
      if (!previous || Number(io.id) > Number(previous.id)) {
        latestIoByCco.set(ccoId, io);
      }
    });

    this.insideWorkshopIds = new Set<number>();
    latestIoByCco.forEach((io, ccoId) => {
      const entered = io?.data?.in;
      const exited = io?.data?.out;
      if (typeof entered === 'string' && entered.trim() !== ''
        && !Number.isNaN(Date.parse(entered))
        && (exited == null || String(exited).trim() === '')) {
        this.insideWorkshopIds.add(ccoId);
      }
    });

    this.tList.map((task)=>{
      const ccoId = Number(this.mntList.find((mnt) => task?.data?.id_mnt === mnt.i)?.data?.id_cco);
      task.isInside = this.insideWorkshopIds.has(ccoId);
      this.mntList.forEach((mnt)=>{
        if(task.data.id_mnt===mnt.i){
          task.data.mnt=mnt;     
        }
      })
      this.atsList.forEach((ats)=>{
        if(task.data.id_ats===ats.i){
           this.stgList.forEach((stg)=>{ 
             if(ats.data.id_stg===stg.i){
               ats.data.stg=stg;     
             }
           })
           task.data.ats=ats;   
           task.data.prueba="prueba";   
        }
      }) 
    });
    this.fltrdTList = this.cco ? this.tList.filter(it => Number(it?.data?.mnt?.data?.id_cco) === Number(this.cco.id)) : [];
    this.fltrdTList=this.fltrdTList.sort((a, b) => a?.data?.ats?.data?.stg?.data?.order-b?.data?.ats?.data?.stg?.data?.order);
  }

  //Buscador Cco
  cco:any;
  selectedItem(p:any){
    this.cco={ ...p };
    this.hash = p?.data?.name || '';
    console.log('selectedItem', p)
    this.filteredCcoList=[];
    this.filterMntList(p.id);
    this.getLocation(p.id);

  }

  filterMntList(id:number) {
    console.log('f id=',id);
    console.log('f fltrdTList=',this.fltrdTList);
    if (id === undefined || id === null) return;
    this.fltrdTList = this.tList.filter(
      (it) => Number(it?.data?.mnt?.data?.id_cco) === Number(id)
    );
    this.fltrdTList.sort((a, b) => a?.data?.ats?.data?.stg?.data?.order - b?.data?.ats?.data?.stg?.data?.order);
  }

  /*filterMntList(p:any){*/
    /*console.log('p pasada',p)*/
    /*console.log('fltrdTList',this.fltrdTList)*/
    /*const mylist:any[]=this.fltrdTList*/
    /*.filter((it)=>{*/
      /*const match = it?.data?.mnt?.data?.id_cco==p.id;*/
      /*console.log('it id_cco==p.id',match)*/
      /*return match;*/
    /*})*/
    /*console.log('fltrdTListi el del filter',mylist);*/
    /*this.fltrdTList=mylist;*/
  /*}*/

  goToStg(p:any){
    const pageRoute = `/app/tabs/mnt-t-getall`;
    this.router.navigate([pageRoute], { 
      state: {
        item: p,
      }     
    }); 
    //this.router.navigate(['/app/tabs/mnt-stg-getall'],   { replaceUrl: true }); 
  }

  goToPatch(p: any) {
    p.oid = this.dateService.getDate();
    const pageRoute = `/app/tabs/mnt-t-ini`;
    this.router.navigate([pageRoute], {
      state: {
        item: p,
        custom: 'prueba'
      }
    });
  }

  /*goToPatch(p:any){*/
    /*const pageRoute = `/app/tabs/mnt-t-stend`;*/
    /*this.router.navigate([pageRoute], { */
      /*state: {*/
        /*item: p,*/
        /*custom:'prueba',*/
        /*oid: this.dateService.getDate()*/
      /*}     */
    /*}); */
    /*//this.router.navigate(['/app/tabs/mnt-stg-getall'],   { replaceUrl: true }); */
  /*}*/

  lctn: string = '';
  locationLoading = false;
  locationError = false;
  private locationSub?: Subscription;
  readonly locationLabels: { [key: string]: string } = {
    sai: 'San Andrés',
    tsai: 'En tránsito: Cartagena → San Andrés',
    ctg: 'Cartagena',
    inb: 'Pasacaballos / Inbemetal',
    port: 'Puerto de Cartagena (esperando embarque)'
  };

  getLocation(id: number): void {
    this.locationSub?.unsubscribe();
    this.lctn = '';
    this.locationLoading = true;
    this.locationError = false;
    this.locationSub = this.lctnService.getLctn(id).subscribe({
      next: res => {
        this.lctn = res;
        this.locationLoading = false;
      },
      error: err => {
        this.locationLoading = false;
        this.locationError = true;
        console.error('Location:', err);
      }
    });
  }


  presentFilter(){
    this.router.navigate(['/app/tabs/p-c-post'],{ replaceUrl: true }); 
  }


  addUser(){
    this.router.navigate(['/app/tabs/mnt-ws-ws'],{ replaceUrl: true });     
  }


}




