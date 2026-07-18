import { ChangeDetectorRef } from '@angular/core';
import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  IonList,
  LoadingController,
  ModalController,
  ToastController,
  Config,
  IonItemSliding
} from '@ionic/angular';
import { ConferenceData } from '../../../../providers/conference-data';
import { UserData } from '../../../../providers/user-data';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '../../../../services/session.service';
import { UtilService } from '../../../../services/util.service';
import { ProductService } from '../../../../services/product.service';
import { DateService } from '../../../../services/local/date.service';
import { UserService } from '../../../../services/user.service';
import { CertService } from '../../../../services/cert/cert.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'page-getall',
  templateUrl: 'getall.html',
  styleUrls: ['./getall.scss'],
})
export class GetallPage implements OnInit {

  @ViewChild(IonList, { static: false }) ionList!: IonList;
  searchSubject: Subject<string> = new Subject();
  certList: any[] = [];
  filteredCertList: any[] = [];
  fullCertList: any[] = [];
  ios: boolean;
  showSearchbar: boolean;
  displayToEnevis=true;
  
  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private dateService: DateService,
    private userService: UserService,
    private certService: CertService,
    private ccoService: CcoService,
  ) {}

  ngOnInit() {
    this.loadCcos();
    this.filteredCertList = [...this.certList];
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((text: string) => {
      const value = text.toLowerCase().trim();
      this.filteredCertList = this.certList.filter(item =>
        JSON.stringify(item).toLowerCase().includes(value)
      );
      console.log(
        'filtered size',
        this.filteredCertList.length
      );
    });
  }

  onSearch2(event: any) {
    console.log('event',event)  
    const value = event || '';
    this.searchSubject.next(value);
  }

  ionViewWillEnter() {
    this.getAll();
  }

  getAll() {
    this.certService.getAll().subscribe({
      next: response => {
        this.certList = response;
        console.log("certList response",this.certList)
        this.fillFullCertList();
      }
    });
  }

  onSearch(text: string) {
    this.searchSubject.next(text);
  }

  plexaUploader(item:any){
    this.router.navigate(    
      ['/app/tabs/cert-main-post'], 
      { state: { item } }    
    );
  } 

  searchTerm: string = ''; 
 
  private buildCcoMap(ccoList: Cco[]): CcoMap {
    const map: CcoMap = {};
    ccoList.forEach((cco, index) => {
      const id = Number(cco.id); // NORMALIZAR
      map[id] = {
        name: cco.data?.name ?? 'N/A',
        color: cco.data?.color ?? '#ccc'
      };
    });
    return map;
  }

  ccoList: Cco[] = [];
  ccoMap: CcoMap = {};

  loadCcos() {
    this.ccoService.getAll().subscribe({
      next: (ccos) => {
        this.ccoList = ccos;
        this.ccoMap = this.buildCcoMap(ccos);
        this.debugCcoMapping();
      },
      error: (err) => console.error('Error loading ccos', err)
    });
  }

  debugCcoMapping() {
    this.filteredList.slice(0, 10).forEach((item, i) => {
      const ccoId = item?.data?.name;
      const cco = this.ccoMap[ccoId];
      if (!cco) {
        console.warn(`NO MATCH para ccoId=${ccoId}`, {
          availableKeys: Object.keys(this.ccoMap)
        });
      } else {
        console.log(`MATCH ccoId=${ccoId} =>`, cco);
      }
    });
  }

  presentFilter(){
    this.displayToEnevis=!this.displayToEnevis;
    console.log('display to enevis',this.displayToEnevis.toString())
  }

  findMostRecentMovement(name: number): any | null {
    return this.certList.reduce((max, item) => {
      if (item?.data?.name !== name) {
        return max;
      }
      if (!max || item.id > max.id) {
        return item;
      }
      return max;
    }, null);
  }

  onCcoSearch(text: string) {
    console.log('text to search',text)
    this.applyFilter(text);  
  }  

  applyFilter(text: string) {
    if (!text || !text.trim()) {
      this.fillFullCertList();
      return;
    }
    const search = text.trim().toLowerCase();
    const ccoIds = this.ccoList
      .filter(cco =>
        String(cco?.data?.name || '')
          .toLowerCase()
          .includes(search)
      )
      .map(cco => Number(cco.id));
    this.fullCertList = this.sortCerts().filter(cert =>
      ccoIds.includes(Number(cert?.data?.istq_id))
    );
    console.log('ccoIds encontrados', ccoIds);
    console.log('fullCertList filtrada', this.fullCertList);
  }

  get filteredList() {
    if (!this.searchTerm) return this.fullCertList;
    const term = this.searchTerm.toLowerCase();
    return this.fullCertList.filter(item =>
      Object.values(item.data).some(val =>
        String(val).toLowerCase().includes(term)
      )
    );
  }

  sortCerts():any[]{
    return [...this.certList].sort((a,b)=>
      a.data.istq_id-b.data.istq_id ||
      a.data.type-b.data.type ||
      Number(a.data.year)-Number(b.data.year)
    );
  }

  openCert(cert:any,isotanqName:string){
    isotanqName=this.formatName(isotanqName);
    let type='';
    if(cert.data.type==1){
      type='total';
    }   
    if(cert.data.type==2){
      type='parcial';
    }
    const url = environment.s3aws+'cert/cert/'+isotanqName+'/'+type+'/'+cert.data.year+'.pdf';
    window.open(url, '_blank');
  }

  formatName(name:string):string{
    return name?.replace(/^(.{4})\s+/, '$1-') || '';
  }

  fillFullCertList(){
    this.fullCertList=this.sortCerts();
    console.log('full',this,this.fullCertList)
  }


}



