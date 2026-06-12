import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';






export interface Cco {
  id: number;
  data: {
    name?: string;
    color?: string;
  };
}

export interface CcoMap {
  [key: number]: {
    name: string;
    color: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CcoService {

  private apiUrl = environment.apiHost; 
  private model = 'cco';

  constructor(private http: HttpClient) {}   
      
  getAll(): Observable<any[]> {   
    return this.http.get<any[]>(`${this.apiUrl}/${this.model}`);
  }   

  getInterval(since: string, until: string): Observable<any[]> {
    const params = [
      `created_at=gte.${since}`,
      `created_at=lte.${until}`
    ].join('&');
    return this.http
      .get<any[]>(`${this.apiUrl}/${this.model}?${params}`)
      .pipe(
        map(response => response ?? []) // si no hay registros → []
      );
  }

  getIntervalByAdate(since: string, until: string): Observable<any[]> {
    const params = [
      `data->>date=gte.${since}`,
      `data->>date=lte.${until}`
    ].join('&');
    return this.http
      .get<any[]>(`${this.apiUrl}/${this.model}?${params}`)
      .pipe(
        map(response => response ?? [])
      );
  }

  post(data:any): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?select=*`;
    const item = {
      data: data
    };
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  patch(id: number, updatedElement: any): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    const body = {
      data: updatedElement  
    };
    return this.http.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    return this.http.delete(url, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  ccoList: Cco[] = [];
  ccoMap: CcoMap = {};

  load(): Observable<CcoMap> {
    return this.getAll().pipe(
      map((ccos) => {
        this.ccoList = ccos;
        const mapData: CcoMap = {};
        ccos.forEach((cco, index) => {
          const id = Number(cco.id);
          mapData[id] = {
            name: cco.data?.name ?? 'N/A',
            color: cco.data?.color ?? '#ccc'
          };
        });
        this.ccoMap = mapData;
        return this.ccoMap;
      })
    );
  }

  getMap(): CcoMap {
    return this.ccoMap;
  }

  getById(id: number | string) {
    return this.ccoMap[Number(id)];
  }

  getName(id: number | string): string {
    console.log("id en el servicio",id)
    console.log("this.ccoMap en el servicio",this.ccoMap)
    
    return this.ccoMap[Number(id)]?.name || 'N/A';
  }

  getColor(id: number | string): string {
    return this.ccoMap[Number(id)]?.color || '#ccc';
  }

  debugMapping(withdrawnList: any[]) {
    console.log(' DEBUG withdrawn -> ccoMap');
    withdrawnList.slice(0, 10).forEach((item, i) => {
      const ccoId = item?.data?.name;
      //console.log(' item[' + i + '] ccoId =>',ccoId,'tipo:',typeof ccoId);
      const cco = this.ccoMap[Number(ccoId)];
      if (!cco) {
        console.warn(
          ' NO MATCH para ccoId=' + ccoId,
          {
            availableKeys: Object.keys(this.ccoMap)
          }
        );
      } else {
        console.log(
          ' MATCH ccoId=' + ccoId + ' =>',
          cco
        );
      }
    });
  }

  findMostRecentMovementOfIsotanq(withdrawnList:any[],ccoId:number):any{
    console.log('==============================');
    console.log('findMostRecentMovementOfIsotanq');
    console.log('ccoId:',ccoId);
    console.log('isArray:',Array.isArray(withdrawnList));
    console.log('items:',withdrawnList?.length);
    const matches=withdrawnList
      ?.filter(x=>Number(x?.data?.name)===Number(ccoId))
      ?.map(x=>x.id);
    console.log('matchingIds:',matches);
    console.log('matchingCount:',matches?.length||0);
    let found:any=null;
    for(const item of withdrawnList){
      if(Number(item?.data?.name)!==Number(ccoId)) continue;
      if(!found||Number(item.id)>Number(found.id)) found=item;
    }
    console.log('resultId:',found?.id);
    console.log('resultName:',found?.data?.name);
    console.log('result:',found);
    console.log('==============================');
    return found;
  }

  getIdByName(name:string):number{
  console.log('name pasado al servicio',name)
  console.log('ccoMap.length servicio',this.ccoMap)
    const input=(name||'')
      .toUpperCase()
      .trim();
    if(!input)
      return 0;
    // extrae los 6 numeros importantes
    const inputMatch=input.match(/\d{6}/);
    const inputCore=inputMatch?.[0]||'';
    for(const key in this.ccoMap){
      const item=this.ccoMap[Number(key)];
      if(!item?.name)
        continue;
      const itemName=item.name
        .toUpperCase()
        .trim();
      // match exacto completo
      if(itemName===input)
        return Number(key);
      // match parcial normal
      if(itemName.includes(input))
        return Number(key);
      // match por los 6 numeros unicos
      const itemMatch=itemName.match(/\d{6}/);
      const itemCore=itemMatch?.[0]||'';
      if(inputCore && itemCore===inputCore)
        return Number(key);
    }
    return 0;
  }


}
