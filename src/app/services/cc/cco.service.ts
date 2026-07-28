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

  /*load(): Observable<CcoMap> {*/
    /*return this.getAll().pipe(*/
      /*map((ccos) => {*/
        /*this.ccoList = ccos;*/
        /*const mapData: CcoMap = {};*/
        /*ccos.forEach((cco, index) => {*/
          /*const id = Number(cco.id);*/
          /*mapData[id] = {*/
            /*name: cco.data?.name ?? 'N/A',*/
            /*color: cco.data?.color ?? '#ccc'*/
          /*};*/
        /*});*/
        /*this.ccoMap = mapData;*/
        /*return this.ccoMap;*/
      /*})*/
    /*);*/
  /*}*/

  getMap(): CcoMap {
    return this.ccoMap;
  }

  getById(id: number | string) {
    return this.ccoMap[Number(id)];
  }

  getName(id: number | string): string {
    return this.ccoMap[Number(id)]?.name || 'N/A';
  }

  getColor(id: number | string): string {
    return this.ccoMap[Number(id)]?.color || '#ccc';
  }

  debugMapping(withdrawnList: any[]) {
    withdrawnList.slice(0, 10).forEach((item, i) => {
      const ccoId = item?.data?.name;
      const cco = this.ccoMap[Number(ccoId)];
    });
  }

  findMostRecentMovementOfIsotanq(withdrawnList:any[],ccoId:number):any{
    const matches=withdrawnList
      ?.filter(x=>Number(x?.data?.name)===Number(ccoId))
      ?.map(x=>x.id);
    let found:any=null;
    for(const item of withdrawnList){
      if(Number(item?.data?.name)!==Number(ccoId)) continue;
      if(!found||Number(item.id)>Number(found.id)) found=item;
    }
    return found;
  }







getIdByName(hash:string):number{
  const norm=(value:string):string=>{
    const raw=(value||'')
      .toUpperCase()
      .trim();
    const digits=(raw.match(/\d/g)||[])
      .join('');
    if(digits.length>=7){
      const result=`${digits.slice(0,6)}-${digits[6]}`;
      return result;
    }
    if(digits.length===6){
      return digits;
    }
    return '';
  };
  const input=norm(hash);
  if(!input){
    return 0;
  }
  const inputCore=input.replace('-','');
  for(const key in this.ccoMap){
    const item=this.ccoMap[Number(key)];
    if(!item?.name){
      continue;
    }
    const itemNorm=norm(item.name);
    if(!itemNorm){
      continue;
    }
    const itemCore=itemNorm.replace('-','');
    if(itemNorm===input){
      return Number(key);
    }

    if(itemCore===inputCore){
      return Number(key);
    }

    if(
      input.length===6 &&
      itemCore.startsWith(input)
    ){
      return Number(key);
    }
  }
  return 0;
}



private ccoMapSubject = new BehaviorSubject<CcoMap>({});
ccoMap$ = this.ccoMapSubject.asObservable();

load(): Observable<CcoMap> {
  return this.getAll().pipe(
    map((ccos) => {
      this.ccoList = ccos;

      const mapData: CcoMap = {};

      ccos.forEach((cco) => {
        const id = Number(cco.id);

        mapData[id] = {
          name: cco.data?.name ?? 'N/A',
          color: cco.data?.color ?? '#ccc'
        };
      });

      this.ccoMap = mapData;
      this.ccoMapSubject.next(mapData);

      return mapData;
    })
  );
}




getNameByHash(hash: string): string {

  const match = hash.match(/\d{6}-\d/);

  if (!match) {
    return 'N/A';
  }

  const target = match[0];

  for (const key in this.ccoMap) {

    const name = this.ccoMap[Number(key)]?.name ?? '';

    const m = name.match(/\d{6}-\d/);

    if (m && m[0] === target) {
      return name;
    }

  }

  return 'N/A';

}



}
