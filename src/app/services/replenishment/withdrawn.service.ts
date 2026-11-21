import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WithdrawnService {
  
  private apiUrl = environment.apiHost; 
  private model = 'withdrawn';

  constructor(private http: HttpClient) {}   

  getAll(): Observable<any[]> {
    const url = `${this.apiUrl}/${this.model}`;
    console.log('[WithdrawnService] GET URL:', url);
    console.log('[WithdrawnService] REQUEST:', { method: 'GET', url });
    return this.http.get<any[]>(url).pipe(
      tap({
        next: (response) => console.log('[WithdrawnService] RESPONSE:', response),
        error: (err) => console.error('[WithdrawnService] ERROR:', err)
      })
    );
  }

  /*getAll(): Observable<any[]> {   */
    /*return this.http.get<any[]>(`${this.apiUrl}/${this.model}`);*/
  /*}   */
  
  getById(id: number): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    return this.http.get<any[]>(url);
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

  getIntervalByCreatedAt(since: string, untilExclusive: string): Observable<any[]> {
    const params = [
      `created_at=gte.${encodeURIComponent(since)}`,
      `created_at=lt.${encodeURIComponent(untilExclusive)}`,
      `order=id.desc`            
    ].join('&');
    return this.http
      .get<any[]>(`${this.apiUrl}/${this.model}?${params}`)
      .pipe(map(response => response ?? []));
  }   

  //el que se usaba hasta noviembre 2026
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

  getIntervalByCreatedAtDate(since: string, until: string): Observable<any[]> {
    const params = [
      `created_at=gte.${since}`,
      `created_at=lte.${until}`
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

  postClone(payload: any): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?select=*`;

    return this.http.post(url, payload, {
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
    console.log('body',body);
    return this.http.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }


  /*patchField(id: number, updatedElement: any): Observable<any> {*/
    /*const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;*/
    /*const body = {*/
      /*data: updatedElement  */
    /*};*/
    /*console.log('body',body);*/
    /*return this.http.patch(url, body, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json',*/
        /*'Prefer': 'return=representation'*/
      /*}*/
    /*});*/
  /*}*/

  delete(id: number): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    return this.http.delete(url, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  updateWithdrawnState(id: number,state:string): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    console.log("id peticion", id)
    console.log("state", state)
    return this.http.patch(
      url,
      { state: state },
      {
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );
  }


  updateShipout(list: any, shipId: number): Observable<any[]> {
    const ids = [...new Set((Array.isArray(list) ? list : []).map((x: any) =>
      Number(typeof x === 'object' && x !== null ? x.id : x)
    ))].filter((id: number) => Number.isInteger(id) && id > 0);
    if (!ids.length) throw new Error('No hay IDs válidos para actualizar');
    if (!Number.isInteger(shipId) || shipId <= 0 || shipId === 3) {
      throw new Error('El barco seleccionado no es válido');
    }
    return this.http.post<any[]>(`${this.apiUrl}/rpc/update_withdrawn_shipout_bulk`, {
      p_ids: ids,
      p_ship_id: shipId
    });
  }


  updatePricesBulk(ids: number[], type: number, prci: number, prcf: number) {
    return this.http.post<{ id: number }[]>(
      `${this.apiUrl}/rpc/update_withdrawn_prices_bulk`,
      { p_ids: ids, p_type: type, p_prci: prci, p_prcf: prcf }
    );
  }


}





