import { Component, ViewChild, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { Subject } from 'rxjs';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { StgService } from '../../../../services/mnt/stg.service';
import { TService } from '../../../../services/mnt/t.service';

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
    private stgService: StgService,
    private tService: TService,
  ) {}

  ionViewWillEnter() {
    this.loadStg();
  }

  ionViewWillLeave() {
    //this.menu.enable(true);
  }

  ngOnInit() {}

  stgList: any[] = []; 
  loadStg() {                
    this.stgService.getAll().subscribe({ 
      next: (res) => {      
        this.stgList=res;
        console.log('stgList:', res);   
        this.stgList.sort((a,b)=>a.data.order-b.data.order)
      }, 
      error: (err) => {      
        console.error(new Error('stack_name:').stack, err);
      } 
    }); 
  }     

  filteredStgList:any[] =[];
  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;
    this.searchSubject.next(value);
    this.filteredStgList = this.searchStg(value, this.stgList);
    console.log('filteredStgList',this.filteredStgList)
  }

  searchStg(hash: string, list: any[]): any[] {
    console.log('lista recibida:', list?.length ?? 0);
    return [];
  }




  /*ccoList: any[] = []; */
  /*loadCco() {                */
    /*this.ccoService.getAll().subscribe({ */
      /*next: (res) => {      */
        /*this.ccoList=res;*/
        /*console.log('ccoList:', res);   */
      /*}, */
      /*error: (err) => {      */
        /*console.error(new Error('stack_name:').stack, err);*/
      /*} */
    /*}); */
  /*}     */


  /*tList: any[] = []; */
  /*loadT(id_cco) {                */
    /*this.tService.getAll().subscribe({ */
      /*next: (res) => {      */
        /*this.tList=res;*/
        /*console.log('tList:', res);   */
        /*this.tList.filter(it=>it.data.id_cco===id_cco).filter(item=>item.state==='doing')*/
      /*}, */
      /*error: (err) => {      */
        /*console.error(new Error('stack_name:').stack, err);*/
      /*} */
    /*}); */
  /*}     */



}


