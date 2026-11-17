import { Component, ViewChild, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UtilService } from '../../../../services/util.service';
import { Subject } from 'rxjs';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { CcoService } from '../../../../services/cc/cco.service';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector:'app-getall',
  templateUrl:'./getall.html',
  styleUrls:['./getall.scss'],
})

export class GetallPage {
  
  ccoMap:CcoMap={};
  ios:boolean;
  showSearchbar:boolean;
  searchSubject=new Subject<string>();

  constructor(
    public alertCtrl:AlertController,
    public confData:ConferenceData,
    public loadingCtrl:LoadingController,
    public modalCtrl:ModalController,
    public router:Router,
    public config:Config,
    private utilService:UtilService,
    private ccoService:CcoService,
    private menu: MenuController,
  ) {}

  ionViewWillEnter() {
    this.loadCco();
  }
 
  ccoList:any[]=[];
  loadCco() {
    this.ccoService.getAll().subscribe({
      next:(r)=>{
        this.ccoList=r;
        console.log('loadCCo',this.ccoList)
      },
      error:(err)=>{
        console.error('Error loading cco',err);
      }
    });
  }

  ioList:any[]=[];
  loadIo(){
    this.ccoService.getAll().subscribe({
      next:(r)=>{            
        this.ccoList=r;      
        console.log('loadCCo',this.ccoList)
      },
      error:(err)=>{         
        console.error('Error loading cco',err);
      }
    });
  }

  wdnList:any[]=[];
  loadWdn(){
    this.ccoService.getAll().subscribe({
      next:(r)=>{            
        this.ccoList=r;      
        console.log('loadCCo',this.ccoList)
            
      },
      error:(err)=>{         
        console.error('Error loading cco',err);
      }
    });
  }

  onSearch(text:string) {
    this.searchSubject.next(text);
  }
 
  hash:string|null=null;
  get fltCcoList() {
    if(this.hash&&this.ccoList?.length>0&&this.ioList?.length>0&&this.wdnList?.length>0){//return this.ccoList;
      const term=this.hash.toLowerCase();
      return this.ccoList.filter(item=>
        Object.values(item.data).some(val=>
          String(val).toLowerCase().includes(term)
        )
      )
    }
  }
 
  patchItem(item:any) {
    console.log("item to patch",item)
  }

}
