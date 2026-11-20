
import { Component } from '@angular/core';
import { MenuController,AlertController,Config,LoadingController,ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject,forkJoin } from 'rxjs';
import { ConferenceData } from '../../../../providers/conference-data';
import { UtilService } from '../../../../services/util.service';
import { CcoMap } from '../../../../interfaces/cco';
import { CcoService } from '../../../../services/cc/cco.service';
import { IoService } from '../../../../services/mnt/io.service';
import { WithdrawnService } from '../../../../services/replenishment/withdrawn.service';

type LocationKey='empty'|'sai'|'tsai'|'full'|'inb'|'ctg';
interface LocationEvent {
  key:LocationKey;
  date:string;
  timestamp:number;
  source:'io'|'wdn';
  record:any;
}

interface LocationData {
  empty:boolean;
  sai:boolean;
  tsai:boolean;
  full:boolean;
  inb:boolean;
  ctg:boolean;
}

@Component({ selector:'app-getall',templateUrl:'./getall.html',styleUrls:['./getall.scss'] })

export class GetallPage {

  ccoMap:CcoMap={};
  ios:boolean=false;
  showSearchbar:boolean=true;
  searchSubject=new Subject<string>();
  ccoList:any[]=[];
  ioList:any[]=[];
  wdnList:any[]=[];
  fltCcoList:any[]=[];
  hash:string|null=null;
  loading=false;
  errorMessage='';
  
  readonly columns:{key:LocationKey;label:string}[]=[
    {key:'sai',label:'SAI'},
    {key:'tsai',label:'En tránsito SAI'},
    {key:'empty',label:'CTG vacio'},
    {key:'ctg',label:'CTG lleno'},
    {key:'inb',label:'INBEMETAL'},
    {key:'full',label:'Puerto esperando embarque'}
  ];

  constructor(
    public alertCtrl:AlertController,
    public confData:ConferenceData,
    public loadingCtrl:LoadingController,
    public modalCtrl:ModalController,
    public router:Router,
    public config:Config,
    private utilService:UtilService,
    private ccoService:CcoService,
    private ioService:IoService,
    private wdnService:WithdrawnService,
    public menu:MenuController
  ) {}

  ionViewWillEnter():void { this.loadCco(); }

  loadCco():void {
    this.loading=true;
    this.errorMessage='';
    forkJoin({cco:this.ccoService.getAll(),io:this.ioService.getAll(),wdn:this.wdnService.getAll()}).subscribe({
      next:r=>{
        this.ccoList=Array.isArray(r.cco)?r.cco:[];
        console.log('ccoList',this.ccoList);
        this.ioList=Array.isArray(r.io)?r.io:[];
        console.log('ioList',this.ioList);
        this.wdnList=Array.isArray(r.wdn)?r.wdn:[];
        console.log('wdnList',this.wdnList);
        this.rebuildList();
        this.loading=false;
      },
      error:err=>{
        this.loading=false;
        this.errorMessage='No fue posible cargar los registros.';
        console.error('Error loading records',err);
      }
    });
  }

  loadIo():void {
    this.ioService.getAll().subscribe({
      next:r=>{ this.ioList=Array.isArray(r)?r:[]; this.rebuildList(); },
      error:err=>console.error('Error loading io',err)
    });
  }

  loadWdn():void {
    this.wdnService.getAll().subscribe({
      next:r=>{ this.wdnList=Array.isArray(r)?r:[]; this.rebuildList(); },
      error:err=>console.error('Error loading wdn',err)
    });
  }

  onSearch(text:string):void {
    this.hash=text||null;
    this.searchSubject.next(text||'');
    this.rebuildList();
  }

  private emptyLocation():LocationData {
    return {empty:false,sai:false,tsai:false,full:false,inb:false,ctg:false};
  }

  private sameCco(value:any,id:any):boolean {
    return value!=null && id!=null && String(value).trim()===String(id).trim();
  }

  private getTimestamp(value:any):number {
    if (typeof value!=='string' || !value.trim()) return 0;
    const timestamp=new Date(value).getTime();
    return Number.isFinite(timestamp)?timestamp:0;
  }

  private getLatestRecord(list:any[],id:any,field:'name'|'id_cco'):any|null {
    const records=list.filter(item=>this.sameCco(item?.data?.[field],id));
    if (!records.length) return null;
    return [...records].sort((a,b)=>{
      const dateA=this.getTimestamp(a?.created_at);
      const dateB=this.getTimestamp(b?.created_at);
      if (dateA!==dateB) return dateB-dateA;
      return Number(b?.id??b?.i??0)-Number(a?.id??a?.i??0);
    })[0];
  }

  private event(key:LocationKey,value:any,source:'io'|'wdn',record:any):LocationEvent|null {
    const timestamp=this.getTimestamp(value);
    if (!timestamp) return null;
    return {key,date:String(value),timestamp,source,record};
  }

  private getEvents(id:any):LocationEvent[] {
    const events:LocationEvent[]=[];
    const wdn=this.getLatestRecord(this.wdnList,id,'name');
    const io=this.getLatestRecord(this.ioList,id,'id_cco');
    const add=(key:LocationKey,value:any,source:'io'|'wdn',record:any):void=>{
      const result=this.event(key,value,source,record);
      if (result) events.push(result);
    };

    if (wdn) {
      const data=wdn.data||{};

      // 1. Puerto CTG vacío
      add('empty',data.datein,'wdn',wdn);

      // 2. CTG
      add('ctg',data.date,'wdn',wdn);

      // 3. CTG por peso neto
      const wnet=Number(data.wnet);
      if (data.wnet!=null && data.wnet!=='' && Number.isFinite(wnet) && wnet>0) {
        add('ctg',data.date,'wdn',wdn);
      }
    }

    if (io) {
      // 4. INBEMETAL
      //add('inb',io?.data?.dateout,'io',io);
      add('inb',io?.created_at,'io',io);
    }

    if (wdn) {
      const data=wdn.data||{};
      const shipout=Number(data.shipout??0);
      const dateout=this.getTimestamp(data.dateout);

      // 5. Puerto CTG lleno
      if (dateout && shipout===0) add('full',data.dateout,'wdn',wdn);

      // 6 y 7. Tránsito SAI o SAI
      if (dateout && Number.isFinite(shipout) && shipout>0) {
        const elapsed=Date.now()-dateout;
        const twoDays=2*24*60*60*1000;
        const key:LocationKey=elapsed>=twoDays?'sai':'tsai';
        add(key,data.dateout,'wdn',wdn);
      }
    }

    return events;
  }

  rebuildList():void {
    const term=(this.hash||'').trim().toLowerCase();
    this.fltCcoList=this.ccoList.filter(item=>{
      if (!term) return true;
      return Object.values(item?.data||{}).some(value=>String(value).toLowerCase().includes(term));
    }).map(item=>{
      const events=this.getEvents(item.id);
      const sorted=[...events].sort((a,b)=>b.timestamp-a.timestamp);
      const latest=sorted[0]||null;
      const lct=this.emptyLocation();
      lct[latest?.key||'sai']=true;
      return {...item,data:{...item.data,lct,lctEvents:events,lctLatest:latest}};
    });
    console.log('fltCcoList rebuilded',this.fltCcoList);
  }

  getCount(key:LocationKey):number {
    return this.fltCcoList.filter(item=>item.data.lct[key]).length;
  }

  trackById(index:number,item:any):any { return item.id??index; }

  patchItem(item:any):void { console.log('item to patch',item); }
}



