
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

type LocationKey='sai'|'tsai'|'ctg'|'port'|'inb';
type LoadState='empty'|'full'|'unknown';
interface LocationEvent {
  key:LocationKey;
  date:string;
  timestamp:number;
  source:'io'|'wdn';
  record:any;
}

interface LocationData {
  sai:boolean;
  tsai:boolean;
  port:boolean;
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
    {key:'ctg',label:'CTG'},
    {key:'inb',label:'INBEMETAL'},
    {key:'port',label:'Puerto / muelle'},
    {key:'tsai',label:'En tránsito SAI'}
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
    return {sai:false,tsai:false,ctg:false,port:false,inb:false};
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

  // La fecha de llenado solo es válida si es posterior a la creación del ciclo.
  private isFilled(wdn:any):boolean {
    if (!wdn) return false;
    const created=this.getTimestamp(wdn.created_at);
    const filled=this.getTimestamp(wdn.data?.date);
    const weight=Number(wdn.data?.wnet);
    return created>0 && filled>created && wdn.data?.wnet!=null &&
      String(wdn.data.wnet).trim()!=='' && Number.isFinite(weight) && weight>0;
  }

  private getCycle(id:any):{wdn:any|null;io:any|null} {
    const wdn=this.getLatestRecord(this.wdnList,id,'name');
    const latestIo=this.getLatestRecord(this.ioList,id,'id_cco');
    // Un IO anterior al registro Withdrawn actual pertenece a un ciclo anterior.
    const cycleStart=this.getTimestamp(wdn?.created_at);
    const io=latestIo && (!wdn || this.getTimestamp(latestIo.created_at)>=cycleStart)
      ?latestIo:null;
    return {wdn,io};
  }

  private getEvents(id:any):LocationEvent[] {
    const events:LocationEvent[]=[];
    const {wdn,io}=this.getCycle(id);
    const add=(key:LocationKey,value:any,source:'io'|'wdn',record:any):void=>{
      const result=this.event(key,value,source,record);
      if (result) events.push(result);
    };

    if (wdn) {
      const data=wdn.data||{};
      const created=this.getTimestamp(wdn.created_at);
      const datein=this.getTimestamp(data.datein);
      const date=this.getTimestamp(data.date);
      const dateout=this.getTimestamp(data.dateout);
      const filled=this.isFilled(wdn);
      const shipout=Number(data.shipout);

      // Inicio de un nuevo ciclo: contenedor vacío desde la creación del registro.
      add('ctg',wdn.created_at,'wdn',wdn);
      if (datein && datein>=created) add('ctg',data.datein,'wdn',wdn);

      // Planta: únicamente se confirma lleno con peso neto y fecha posterior a created_at.
      if (filled) add('ctg',data.date,'wdn',wdn);

      // Puerto y navegación solo son posibles después del llenado confirmado.
      if (filled && dateout && dateout>=date && date>created) {
        if (Number.isFinite(shipout) && shipout===0) {
          add('port',data.dateout,'wdn',wdn);
        } else if (Number.isFinite(shipout) && shipout>0) {
          const twoDays=2*24*60*60*1000;
          const updated=this.getTimestamp(wdn.updated_at);
          // El barco asignado (shipout > 0) inicia el conteo desde updated_at.
          // Hasta 2 días inclusive: tránsito; después de 2 días: SAI.
          // La distinción lleno/vacío en SAI ocurre al superar 6 días.
          if (updated>0) {
            const elapsed=Math.max(0,Date.now()-updated);
            add(elapsed<=twoDays?'tsai':'sai',wdn.updated_at,'wdn',wdn);
          }
        }
      }
    }

    // Taller/patio opcional; no debe reemplazar un evento posterior del ciclo.
    if (io) add('inb',io.created_at,'io',io);
    return events;
  }

  private getLoadState(key:LocationKey|null,wdn:any|null,latest:LocationEvent|null):LoadState {
    // CTG reúne vacío (inicio/datein) y lleno (date validada).
    // Solo el evento de llenado confirmado permite mostrar CTG como lleno.
    if (key==='ctg') {
      const filledAt=this.getTimestamp(wdn?.data?.date);
      return this.isFilled(wdn) && latest?.source==='wdn' &&
        latest.timestamp===filledAt ? 'full' : 'empty';
    }
    if (key==='port') return 'full';

    // La asignación de barco marca el comienzo del plazo de seis días.
    // updated_at es la referencia temporal, no dateout ni created_at.
    // Mientras no hayan pasado seis días, el contenedor sigue lleno,
    // tanto en tránsito como en SAI.
    const shipout=Number(wdn?.data?.shipout);
    if ((key==='tsai'||key==='sai') && wdn && wdn.data?.shipout!=null && String(wdn.data.shipout).trim()!=='' &&
        Number.isFinite(shipout) && shipout>0) {
      const updated=this.getTimestamp(wdn.updated_at);
      const sixDays=6*24*60*60*1000;
      return updated>0 && Date.now()-updated>sixDays?'empty':'full';
    }

    if (key==='inb') return this.isFilled(wdn)?'full':'unknown';
    return 'unknown';
  }

  rebuildList():void {
    const term=(this.hash||'').trim().toLowerCase();
    this.fltCcoList=this.ccoList.filter(item=>{
      if (!term) return true;
      return Object.values(item?.data||{}).some(value=>String(value).toLowerCase().includes(term));
    }).map(item=>{
      const {wdn}=this.getCycle(item.id);
      const events=this.getEvents(item.id);
      const sorted=[...events].sort((a,b)=>b.timestamp-a.timestamp);
      // Un embarque confirmado del ciclo vigente prevalece sobre eventos IO:
      // el contenedor no puede aparecer simultáneamente en taller y en SAI.
      const shipment=sorted.find(e=>e.source==='wdn' && (e.key==='tsai'||e.key==='sai'));
      const latest=shipment||sorted[0]||null;
      const lct=this.emptyLocation();
      // Mantener SAI como estado de espera si aún no existe un nuevo ciclo.
      const key:LocationKey=latest?.key||'sai';
      lct[key]=true;
      const loadState=this.getLoadState(key,wdn,latest);
      return {...item,data:{...item.data,lct,lctEvents:events,lctLatest:latest,
        loadState,isFull:loadState==='full'}};
    });
    console.log('fltCcoList rebuilded',this.fltCcoList);
  }

  getCount(key:LocationKey):number {
    return this.fltCcoList.filter(item=>item.data.lct[key]).length;
  }

  trackById(index:number,item:any):any { return item.id??index; }

  patchItem(item:any):void { console.log('item to patch',item); }
}



