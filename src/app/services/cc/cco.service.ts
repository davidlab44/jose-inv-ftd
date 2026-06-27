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







getIdByName(hash:string):number{
  console.log('========================================');
  console.log('findIdByName');
  console.log('hash recibido:',hash);
  console.log('ccoMap keys:',Object.keys(this.ccoMap||{}).length);

  const norm=(value:string):string=>{
    const raw=(value||'')
      .toUpperCase()
      .trim();

    const digits=(raw.match(/\d/g)||[])
      .join('');

    console.log('----------------------------------------');
    console.log('norm()');
    console.log('raw:',raw);
    console.log('digits:',digits);

    if(digits.length>=7){
      const result=`${digits.slice(0,6)}-${digits[6]}`;
      console.log('normalized(7):',result);
      return result;
    }

    if(digits.length===6){
      console.log('normalized(6):',digits);
      return digits;
    }

    console.log('normalized: INVALID');
    return '';
  };

  const input=norm(hash);

  console.log('input normalized:',input);

  if(!input){
    console.log('input invalido -> return 0');
    console.log('========================================');
    return 0;
  }

  const inputCore=input.replace('-','');

  console.log('inputCore:',inputCore);

  for(const key in this.ccoMap){

    const item=this.ccoMap[Number(key)];

    console.log('----------------------------------------');
    console.log('checking key:',key);
    console.log('item:',item);

    if(!item?.name){
      console.log('skip: no name');
      continue;
    }

    const itemNorm=norm(item.name);

    console.log('item.name:',item.name);
    console.log('itemNorm:',itemNorm);

    if(!itemNorm){
      console.log('skip: itemNorm invalido');
      continue;
    }

    const itemCore=itemNorm.replace('-','');

    console.log('itemCore:',itemCore);

    if(itemNorm===input){
      console.log('MATCH EXACT');
      console.log('return id:',Number(key));
      console.log('========================================');
      return Number(key);
    }

    if(itemCore===inputCore){
      console.log('MATCH CORE');
      console.log('return id:',Number(key));
      console.log('========================================');
      return Number(key);
    }

    if(
      input.length===6 &&
      itemCore.startsWith(input)
    ){
      console.log('MATCH PREFIX');
      console.log('return id:',Number(key));
      console.log('========================================');
      return Number(key);
    }

    console.log('NO MATCH');
  }

  console.log('SIN RESULTADOS');
  console.log('return 0');
  console.log('========================================');

  return 0;
}




}
