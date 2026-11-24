import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { IoService } from '../mnt/io.service';
import { WithdrawnService } from '../replenishment/withdrawn.service';

export type LocationKey = 'sai' | 'tsai' | 'ctg' | 'port' | 'inb';

interface LocationEvent {
  key: LocationKey;
  date: string;
  timestamp: number;
  source: 'io' | 'wdn';
  record: any;
}

@Injectable({ providedIn: 'root' })
export class LctnService {
  constructor(
    private ioService: IoService,
    private wdnService: WithdrawnService
  ) {}

  getLctn(id: number): Observable<LocationKey> {
    return forkJoin({
      io: this.ioService.getAll(),
      wdn: this.wdnService.getAll()
    }).pipe(
      map(r => this.resolveLctn(id,
        Array.isArray(r.wdn) ? r.wdn : [],
        Array.isArray(r.io) ? r.io : []))
    );
  }

  // Permite reutilizar listas ya cargadas sin nuevas consultas HTTP.
  resolveLctn(id: number, wdnList: any[], ioList: any[]): LocationKey {
    const sorted = this.getEvents(id, wdnList, ioList)
      .sort((a, b) => b.timestamp - a.timestamp);
    const shipment = sorted.find(e => e.source === 'wdn' &&
      (e.key === 'tsai' || e.key === 'sai'));
    return (shipment || sorted[0])?.key || 'sai';
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

  private getCycle(id:any, wdnList:any[], ioList:any[]):{wdn:any|null;io:any|null} {
    const wdn=this.getLatestRecord(wdnList,id,'name');
    const latestIo=this.getLatestRecord(ioList,id,'id_cco');
    // Un IO anterior al registro Withdrawn actual pertenece a un ciclo anterior.
    const cycleStart=this.getTimestamp(wdn?.created_at);
    const io=latestIo && (!wdn || this.getTimestamp(latestIo.created_at)>=cycleStart)
      ?latestIo:null;
    return {wdn,io};
  }

  private getEvents(id:any, wdnList:any[], ioList:any[]):LocationEvent[] {
    const events:LocationEvent[]=[];
    const {wdn,io}=this.getCycle(id, wdnList, ioList);
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

}



