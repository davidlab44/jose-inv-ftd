import { Component, ViewChild, OnInit } from '@angular/core';
import { Location } from '@angular/common'; 
import { MenuController } from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { OpportunityService } from '../../../../services/opportunity.service';
import { PosOrderService } from '../../../../services/pos-order.service';
import { TableService } from '../../../../services/table.service';
import { Ship,ShipMap } from '../../../../interfaces/ship';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { BarcodeService } from '../../../../services/barcode.service';
import { CategoryService } from '../../../../services/category.service';
import { Product } from '../../../../interfaces/product';
import { Subject } from 'rxjs';
import { DateService } from '../../../../services/local/date.service';
import { RexService } from '../../../../services/rex.service';
import { ProdrexService } from '../../../../services/prodrex.service';
import { UserService } from '../../../../services/user.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { CcoService } from '../../../../services/cc/cco.service';
import { ShipService } from '../../../../services/logistic/ship.service';
import { AlertController,Config,IonList,LoadingController,ModalController,ToastController } from '@ionic/angular';
import { ActivatedRoute,Router } from '@angular/router';
import { BlgService } from '../../../../services/ats/blg.service';
import { SrcService } from '../../../../services/ats/src.service';

@Component({
  selector:'app-getall',
  templateUrl:'./getall.html',
  styleUrls:['./getall.scss'],
})

export class GetallPage implements OnInit {
  @ViewChild(IonList,{ static:false }) ionList!:IonList;
  withdrawnList:any[]=[];
  fullWithdrawnList:any[]=[];
  ccoMap:CcoMap={};
  shipList:Ship[]=[];
  shipMap:ShipMap={};
  /*  dayRange={*/
    /*lower:1,*/
    /*upper:this.getTodayDayOfYear()*/
  /*};*/
  startDay=1;
  //endDay=this.dayRange.upper;
  types=[
    { value:1,name:'Nacional' },
    { value:2,name:'Importado' }
  ];
  vendors=[
    { value:1,name:'Plexa' },
    { value:2,name:'Plexa port' }
  ];
  filterType:number=this.types[0].value;
  filterVendor:number=this.vendors[0].value;
  valor1=0;
  valor2=0;
  valor3=0;
  valor4=0;
  totalKg=0;
  totalGlpOpc=0;
  totalGlpImportado=0;
  ios:boolean;
  showSearchbar:boolean;
  searchSubject=new Subject<string>();
  searchTerm:string='';
  sortColumn:string='';
  sortDirection:'asc'|'desc'='asc';
  private rangeTimeout:any;

  constructor(
    private barcodeService:BarcodeService,
    public alertCtrl:AlertController,
    public confData:ConferenceData,
    public loadingCtrl:LoadingController,
    public modalCtrl:ModalController,
    public router:Router,
    public toastCtrl:ToastController,
    public user:UserData,
    public config:Config,
    private utilService:UtilService,
    private withdrawnService:WithdrawnService,
    private ccoService:CcoService,
    private shipService:ShipService,
    private menu: MenuController,
    private location: Location,
    private srcService: SrcService
  ) {}


  ionViewWillLeave() {
      this.menu.enable(true);
  }

  ngOnInit() {
    this.loadSubtasks();
  }
  ionViewWillEnter() {
  }

  subtasksList: any[] = []; 
  loadSubtasks() {                
    this.srcService.getAll().subscribe({ 
      next: (res) => {      
        this.subtasksList=res;
        console.log('subtasksLis :', res);    
      }, 
      error: (err) => {      
        console.error('Error al cargar subtasks:', err); 
      } 
    }); 
  }     


}


