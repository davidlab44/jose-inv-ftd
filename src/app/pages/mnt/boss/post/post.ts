import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController,IonList,LoadingController,ModalController,ToastController,Config } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AtsService } from '../../../../services/ats/ats.service';
import { TService } from '../../../../services/mnt/t.service';
import { LstService } from '../../../../services/local/lst/lst.service';
import { UtilService } from '../../../../services/util.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
  styleUrls: ['./post.scss'],
})
export class AssetSupplyPostPage {

  ios: boolean;
  segment = 'all';
  showSearchbar: boolean;
  filteredTaskList: any[] = [];
  searchSubject = new Subject<string>();
  todayDate:any;
  form!: FormGroup;
  replenishmentList: any[] = [];
  uploadProgress = 0;
  uploadedUrl: string | null = null;
  uploading = false;
  task: any;

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public config: Config,
    private userService: UserService,
    private tService: TService,
    private atsService: AtsService,
    private lstService: LstService,
    private utilService: UtilService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    console.log("Item recibido en patch:", navigation);
    //this.user = this.router.getCurrentNavigation()?.extras?.state?.user;
    if(this.router.getCurrentNavigation()?.extras?.state?.task){
      this.task=this.router.getCurrentNavigation()?.extras?.state?.task;
    }
    console.log('task recibido router',this.task);
  }

  hash:string='';
  table:any
  rexDocument:any;

  ngOnInit() {
    this.loadUsers();
  }
  updateSchedule(){}

  // Reservado para incorporar filtros de usuarios.
  presentFilter() {}

  //atsList:any[]=[];
  /*  loadAts() {*/
    /*this.atsService.getAll().subscribe({*/
      /*next: (data) => {*/
        /*this.atsList = data || [];*/
        /*console.log('ats list:', this.atsList);*/
        /*this.mapAts(this.atsList)*/
      /*},*/
      /*error: (err) => {*/
        /*console.error(' error cargando ats:', err);*/
      /*}*/
    /*});*/
  /*}*/

  ionViewDidEnter() {
    //this.loadAts();
  }

  //no esta funcionando en esta activity
  onSearch(text: string | null | undefined) {
    const value = text ?? '';
    this.hash = value;
    this.searchSubject.next(value);
  }
  userList: any[] = []; 
  loadUsers() {                
   this.userService.getAll().subscribe({ 
      next: (res) => {       
        console.log('userList:', res);    
        this.userList = res; 
      }, 
      error: (err) => {      
        console.error('Error al cargar categorías:', err); 
      } 
    }); 
  }     

  user:any;
  selectUser(u: any) {
    this.user=u;
    console.log('selectedUser', this.user);
  }

  /*restartQty(p:any){*/
    /*console.log('p.data.qty',p);*/
    /*p.data.qty=0;*/
  /*}*/

  resetList(list: any[]) { list = []; }

  filledTaskList: any[] = [];
  mapAts(atsList: any[]) {
    console.log('task map',this.task);
    console.log('atsList map',atsList);
    const ats = atsList.find(ats => ats.i === this.task.data?.id_ats);
    this.task.data.ats=ats;
    console.log('filledTask', this.task);
  }

  guardar() {
    console.log('selectedUser in patch',this.user)
    console.log('selectedTask in patch',this.task)
    let asgn:any=[];
    asgn.push(this.user.id)
    this.task.data.asgn=asgn;
    console.log('selectedTask2 in patch',this.task)
    /*this.tService.patch(this.task.id,this.task).subscribe({*/
      /*next: (response) => {*/
        /*console.log("mnt_t response", response);*/
        /*if(response && response.length>0){*/
          /*this.utilService.presentToast('usuario actualizado exitosamente')*/
          /*this.router.navigate(['/app/tabs/mnt-t-ini'],   { replaceUrl: true });    */
        /*}*/
      /*}*/
    /*});*/
    this.tService.patchDataAttribute('mnt_t',this.task.id,'asgn',[this.user.id]).subscribe({
      next: (response) => {
        console.log("mnt_t response", response);
          this.utilService.presentToast('usuario actualizado exitosamente','success',500)
          this.goBackToTask();
      }
    });
  }

  goBackToTask() {
    const pageRoute = `/app/tabs/mnt-t-ini`;
    this.router.navigate([pageRoute], {
      state: {
        item: this.task,
        custom: 'prueba'
      }
    });
  }



}


