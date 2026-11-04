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

  presentFilter(){
    this.displayToEnevis=!this.displayToEnevis;
  }

  onCcoSearch(text:string){
    this.applyFilter(text);
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



getAll(){
  this.certService.getAll().subscribe({
    next:response=>{
      this.certList=response;
      this.fillFullCertList();
    }
  });
}
loadCcos(){
  this.ccoService.getAll().subscribe({
    next:ccos=>{
      this.ccoList=ccos;
      this.ccoMap=this.buildCcoMap(ccos);
      this.fillFullCertList();
    },
    error:err=>{
      console.error('Error loading ccos',err);
    }
  });
}
fillFullCertList(){
  this.fullCertList=this.groupCertList(this.certList);
}
applyFilter(text:string){
  const search=(text||'').trim().toLowerCase();
  if(!search){
    this.fillFullCertList();
    return;
  }
  const grouped=this.groupCertList(this.certList);
  this.fullCertList=grouped.filter(g=>
    String(g.istq_id).includes(search) ||
    String(g.name||'').toLowerCase().includes(search) ||
    g.certs.some((c:any)=>
      String(c.data.year||'').includes(search) ||
      String(c.data.type==1?'total':'parcial').includes(search)
    )
  );
}
sortCerts(list:any[]=this.certList):any[]{
  return [...list].sort((a,b)=>
    (+a.data.istq_id)-(+b.data.istq_id) ||
    (+a.data.type)-(+b.data.type) ||
    (+a.data.year)-(+b.data.year)
  );
}
private groupCertList(list:any[]=this.certList):any[]{
  const map=new Map<number,any>();
  for(const cert of this.sortCerts(list)){
    const istq=+cert.data.istq_id;
    let group=map.get(istq);
    if(!group){
      group={
        istq_id:istq,
        name:this.ccoMap[istq]?.name ?? 'N/A',
        color:this.ccoMap[istq]?.color ?? '#ddd',
        certs:[]
      };
      map.set(istq,group);
    }
    group.certs.push(cert);
  }
  return Array.from(map.values());
}





}
