import { Component,ViewChild,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonList,Config } from '@ionic/angular';
import { CertService } from '../../../../services/cert/cert.service';
import { CcoService } from '../../../../services/cc/cco.service';
import { Cco,CcoMap } from '../../../../interfaces/cco';
import { environment } from '../../../../../environments/environment';

@Component({
  selector:'page-getall',
  templateUrl:'getall.html',
  styleUrls:['getall.scss']
})
export class GetallPage implements OnInit{

  @ViewChild(IonList,{static:false})
  ionList!:IonList;

  certList:any[]=[];
  fullCertList:any[]=[];

  ios:boolean;
  showSearchbar:boolean;
  displayToEnevis=true;

  ccoList:Cco[]=[];
  ccoMap:CcoMap={};

  constructor(
    public router:Router,
    public config:Config,
    private certService:CertService,
    private ccoService:CcoService
  ){}

  ngOnInit(){
    this.loadCcos();
  }

  ionViewWillEnter(){
    this.getAll();
  }

  getAll(){
    this.certService.getAll().subscribe({
      next:response=>{
        this.certList=response;
        this.fillFullCertList();
      }
    });
  }

  plexaUploader(item:any){
    this.router.navigate(
      ['/app/tabs/cert-main-post'],
      {state:{item}}
    );
  }

  private buildCcoMap(ccoList:Cco[]):CcoMap{

    const map:CcoMap={};

    ccoList.forEach(cco=>{
      map[Number(cco.id)]={
        name:cco.data?.name ?? 'N/A',
        color:cco.data?.color ?? '#ccc'
      };
    });

    return map;
  }

  loadCcos(){
    this.ccoService.getAll().subscribe({
      next:ccos=>{
        this.ccoList=ccos;
        this.ccoMap=this.buildCcoMap(ccos);
      },
      error:err=>{
        console.error('Error loading ccos',err);
      }
    });
  }

  presentFilter(){
    this.displayToEnevis=!this.displayToEnevis;
  }

  onCcoSearch(text:string){
    this.applyFilter(text);
  }

  applyFilter(text:string){

    if(!text?.trim()){
      this.fillFullCertList();
      return;
    }

    const search=text.trim().toLowerCase();

    const ccoIds=this.ccoList
      .filter(cco=>
        String(cco?.data?.name||'')
          .toLowerCase()
          .includes(search)
      )
      .map(cco=>Number(cco.id));

    this.fullCertList=this.sortCerts().filter(cert=>
      ccoIds.includes(Number(cert?.data?.istq_id))
    );
  }

  sortCerts():any[]{
    return [...this.certList].sort((a,b)=>
      a.data.istq_id-b.data.istq_id ||
      a.data.type-b.data.type ||
      Number(a.data.year)-Number(b.data.year)
    );
  }

  fillFullCertList(){
    this.fullCertList=this.sortCerts();
  }

  openCert(cert:any,isotanqName:string){

    const type=
      cert.data.type===1
        ? 'total'
        : 'parcial';

    const url=
      environment.s3aws+
      'cert/cert/'+
      this.formatName(isotanqName)+'/'+
      type+'/'+
      cert.data.year+
      '.pdf';

    window.open(url,'_blank');
  }

  formatName(name:string):string{
    return name?.replace(/^(.{4})\s+/,'$1-') || '';
  }
}
