import { Component, ViewChild, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Subject } from 'rxjs';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { IoService } from '../../../../services/mnt/io.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { TService } from '../../../../services/mnt/t.service';
import { MntService } from '../../../../services/mnt/mnt.service';

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
  ) {}

  ionViewWillEnter() {
    this.loadMnt();
    this.loadTasks();
    this.loadCco();
  }

  ionViewWillLeave() {}

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
      return;
    return list.filter((it)=>it.data.name.includes(hash));
  }

  ccoList: any[] = []; 
  loadCco(){                
    this.ccoService.getAll().subscribe({ 
      next: (res) => {      
        this.ccoList=res;
        console.log('ccoList :', res);    
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
        this.fltrdTList=this.tList;

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
        this.builTaskFullList();
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  builTaskFullList(){
    this.fltrdTList.map((task)=>{
      this.mntList.forEach((mnt)=>{
        if(task.data.id_mnt===mnt.i){
          task.data.mnt=mnt;     
        }
      })
    });
    console.log('load/build full fltrdTList',this.fltrdTList)
  }

  selectedItem(p:any){
    console.log('selectedItem', p)
    this.filteredCcoList=[];
    this.filterMntList(p);
  }

  filterMntList(p:any){
    console.log('p pasada',p)
    const mylist:any[]=this.fltrdTList
    .filter((it)=>{
      //it.data.mnt.data.id_cco==1
      //it.data.mnt.data.id_cco==p.idd&&it.state==='c'&&it.data.dateapv===null
      //console.log('it',it)
      //console.log('it id_cco',it.data.mnt.data.id_cco)
      const match = it.data.mnt.data.id_cco==p.id;
      console.log('it id_cco==p.id',match)
      return match;
    })
    console.log('fltrdTListi el del filter',mylist);
    this.fltrdTList=mylist;
  }

  /*filterMntList(p:any){*/
    /*this.fltrdTList=this.tList.filter((it)=>it.data.id_cco==p.id);     */
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


}


