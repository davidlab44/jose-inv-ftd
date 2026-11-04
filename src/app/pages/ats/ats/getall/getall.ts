import { Component, ViewChild, OnInit } from '@angular/core';
import { Location } from '@angular/common'; 
import { MenuController } from '@ionic/angular';
import { UserData } from '../../../../providers/user-data';
import { UtilService } from '../../../../services/util.service';
import { Subject } from 'rxjs';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { ActivatedRoute,Router } from '@angular/router';
import { AtsService } from '../../../../services/ats/ats.service';

@Component({
  selector:'app-getall',
  templateUrl:'./getall.html',
  styleUrls:['./getall.scss'],
})

export class GetallPage implements OnInit {
  withdrawnList:any[]=[];
  startDay=1;
  ios:boolean;
  showSearchbar:boolean;
  searchSubject=new Subject<string>();
  searchTerm:string='';

  constructor(
    public router:Router,
    public user:UserData,
    private utilService:UtilService,
    private menu: MenuController,
    private atsService: AtsService
  ) {}

  ionViewWillLeave() {
      this.menu.enable(true);
  }

  ngOnInit() {
    this.loadTasks();
  }

  taskList: any[] = []; 
  loadTasks() {                
    this.atsService.getAll().subscribe({ 
      next: (res)=>{      
        this.taskList=res;
        console.log('taskLis :', res);    
      }, 
      error: (err) => {      
        console.error('Error al cargar tasks:', err); 
      } 
    }); 
  }     

}


