import { Component, ViewChild, OnInit } from '@angular/core';
import { Location } from '@angular/common'; 
import { MenuController } from '@ionic/angular';
import { UserData } from '../../../../providers/user-data';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../interfaces/product';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
import { UserService } from '../../../../services/user.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { CcoService } from '../../../../services/cc/cco.service';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { AtsService } from '../../../../services/ats/ats.service';

@Component({
  selector:'app-getall',
  templateUrl:'./getall.html',
  styleUrls:['./getall.scss'],
})

export class GetallPage implements OnInit {
  @ViewChild(IonList,{ static:false }) ionList!:IonList;
  withdrawnList:any[]=[];
  startDay=1;
  ios:boolean;
  showSearchbar:boolean;
  searchSubject=new Subject<string>();
  searchTerm:string='';

  constructor(
    public modalCtrl:ModalController,
    public router:Router,
    public user:UserData,
    public config:Config,
    private utilService:UtilService,
    private withdrawnService:WithdrawnService,
    private ccoService:CcoService,
    private menu: MenuController,
    private location: Location,
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
      next: (res) => {      
        this.taskList=res;
        console.log('taskLis :', res);    
      }, 
      error: (err) => {      
        console.error('Error al cargar tasks:', err); 
      } 
    }); 
  }     

}


