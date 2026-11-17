import { Component, ViewChild, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Subject } from 'rxjs';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { IoService } from '../../../../services/mnt/io.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { DateService } from '../../../../services/local/date.service';

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
    private dateService: DateService,
  ) {}

  ionViewWillEnter() {
    this.loadIo();
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

  ioList: any[] = []; 
  fltrdIoList: any[] = []; 
  loadIo() {                
    this.ioService.getAll().subscribe({ 
      next: (res) => {      
        this.ioList=res;
        console.log('ioList :', res);
        this.fltrdIoList=this.ioList;
        this.loadCco();
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  ccoList: any[] = [];
  loadCco() {
    this.ccoService.getAll().subscribe({
      next: (res) => {
        this.ccoList = res;
        const ccoMap = new Map(
          this.ccoList.map((cco) => [cco.id, cco])
        );
        this.fltrdIoList = this.fltrdIoList.filter((io) => {
          const cco = ccoMap.get(io.data.id_cco);
          if (!cco) return false;
          io.data.date = this.formatDate(io.created_at);
          io.data.cco = cco;
          return true;
        }).reverse();
        console.log('fltrdIoList:', this.fltrdIoList);
      },
      error: (err) => {
        console.error(new Error('stack_name:').stack, err);
      }
    });
  }

  selectedItem(p:any){
    console.log('selectedItem', p)
    this.filteredCcoList=[];
  }

  formatDate(date:any){
    return this.dateService.formatFechaEsCo(date);
  }

  /*filterMntList(p:any){*/
    /*this.fltrdIoList=this.ioList.filter((it)=>it.data.id_cco==p.id);     */
  /*}*/


}


