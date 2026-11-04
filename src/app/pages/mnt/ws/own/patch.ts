import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { PhotoService } from '../../../../services/asset/photo.service';
import { TService } from '../../../../services/mnt/t.service';
import { UtilService } from '../../../../services/util.service';
import { UserService } from '../../../../services/user.service';
import { DateService } from '../../../../services/local/date.service';
import { AtsService } from '../../../../services/ats/ats.service';
import { StgService } from '../../../../services/mnt/stg.service';
import { MntService } from '../../../../services/mnt/mnt.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { Router } from '@angular/router';
interface PhotoEntry { img: string; date: string; status: string; note: string; pending?: boolean; replacesUrl?: string; saving?: boolean; dirty?: boolean; }
interface Annotation { type: 'point' | 'circle' | 'arrow'; x1: number; y1: number; x2?: number; y2?: number; }

@Component({ selector: 'page-patch', templateUrl: 'patch.html', styleUrls: ['./patch.scss'] })
export class PatchPage {

  user:any;
  taskList:any[]=[];
  task:any;
  now:any;

  constructor(private router: Router, 
              private photoService: PhotoService,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController,
              private tService: TService, 
              private userService: UserService, 
              private utilService: UtilService, 
              private dateService: DateService, 
              private atsService: AtsService, 
              private stgService: StgService, 
              private mntService: MntService, 
              private ccoService: CcoService, 
             ) {
    const navigation = this.router.getCurrentNavigation();
    console.log("Item recibido en patch:", navigation);
    this.user = this.router.getCurrentNavigation()?.extras?.state?.user;
    this.taskList = this.router.getCurrentNavigation()?.extras?.state?.taskList;
    console.log('user recibido router',this.user);
    console.log('taskList recibido router',this.taskList);
  }

  ngOnInit(){
    this.now=new Date().toISOString();
  }

  filteredTaskList: any[] = [];
  ionViewWillEnter() {
    this.filteredTaskList = this.taskList.filter(
      (task) => task?.data?.asgn?.includes(this.user?.id)
    );
    console.log('filteredTaskList',this.filteredTaskList)
    this.loadCco();
  }

  ccoList: any[] = [];
  loadCco() {
    this.ccoService.getAll().subscribe({
      next: (r) => {
        this.ccoList = r;
        console.log('loadCco', this.ccoList);
        this.loadAts();
      },
      error: err => console.log('loadMnt error', err)
    });
  }

  atsList:any[]=[];
  loadAts(){
    this.atsService.getAll().subscribe({
      next:(r)=>{
        this.atsList=r;
        console.log('loadAts',this.atsList);
        this.mapTask();
      },
      error:err=>console.log('loadAsts errror',err)
    })
  }

  mappedList: any[] = [];
  mapTask() {
    this.mappedList = this.filteredTaskList.map(task => {
      const ats = this.atsList.find(ats => ats.i === task.data?.id_ats);
      return {
        ...task,
        data: {
          ...task.data,
          ats: ats
        }
      };
    });
    console.log('mappedList',this.mappedList)
    this.loadMnt();
  }


mntList: any[] = [];
loadMnt() {
  this.mntService.getAll().subscribe({
    next: (r) => {
      this.mntList = r;
      console.log('loadMnt', this.mntList);
      if (this.mntList?.length > 0) {
        // 1. Agregar cco a cada item de mntList
        this.mntList = this.mntList.map(mnt => {
          const cco = this.ccoList.find(
            cco => mnt.data?.id_cco === cco.id
          );
          return {
            ...mnt,
            data: {
              ...mnt.data,
              cco: cco ?? null
            }
          };
        });
        // 2. Agregar mnt (con su cco) a cada task
        this.mappedList = this.mappedList.map(task => {
          const mnt = this.mntList.find(
            mnt => task.data?.id_mnt === mnt.i
          );
          return {
            ...task,
            data: {
              ...task.data,
              mnt: mnt ?? null
            }
          };
        });
      }
      console.log('loadMnt mntList', this.mntList);
      console.log('loadMnt mappedList', this.mappedList);
    },
    error: err => console.log('loadMnt error', err)
  });
}



  /*mntList: any[] = [];*/
  /*loadMnt() {*/
    /*this.mntService.getAll().subscribe({*/
      /*next: (r) => {*/
        /*this.mntList = r;*/
        /*console.log('loadMnt', this.mntList);*/
        /*if (this.mntList?.length > 0) {*/
          /*this.mappedList = this.mappedList.map(task => {*/
            /*const mnt = this.mntList.find(*/
              /*mnt => task.data?.id_mnt === mnt.i*/
            /*);*/
            /*return {*/
              /*...task,*/
              /*data: {*/
                /*...task.data,*/
                /*mnt: mnt ?? null*/
              /*}*/
            /*};*/
          /*});*/
        /*}*/
        /*console.log('loadMnt mappedList', this.mappedList);*/
      /*},*/
      /*error: err => console.log('loadMnt error', err)*/
    /*});*/
  /*}*/

  goToTaskEnd() {
    //p.oid = this.dateService.getDate();
    const pageRoute = `/app/tabs/mnt-t-end`;
    this.router.navigate([pageRoute], {
      state: {
        item: this.task,
        custom: 'prueba'
      }
    });
  }

  requestSpv(task){
    console.log('task pasada ',task)
  }

}
