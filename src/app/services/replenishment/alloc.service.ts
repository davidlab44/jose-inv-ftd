import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
                                                                                                                                          
@Injectable({
  providedIn: 'root'         
})
export class AllocService {
 
  private model = 'replenishment_alloc';  
  private apiUrl = environment.apiHost; 
      
  constructor(private http: HttpClient) {
  }   
       
  getAll(): Observable<any[]> {   
    return this.http.get<any[]>(`${this.apiUrl}/replenishment_glp_prices`);
  }   
      
  getLast(): Observable<any> {
    return this.http
      .get<any[]>(`${this.apiUrl}/replenishment_glp_prices?order=id.desc&limit=1`)
      .pipe(
        map(results => results[0] ?? null)
      );
  }

  getLast20(): Observable<any> {
    return this.http
      .get<any[]>(`${this.apiUrl}/replenishment_glp_prices?order=id.desc&limit=20`)
      .pipe(
        map(results => results[0] ?? null)
      );
  }

  addGlpprice(price: number,cents:number,init:string,end:string,id_replenishment_product:number): Observable<any> {
    const url = `${this.apiUrl}/replenishment_glp_prices?select=*`;
    const item = {
      data: {
        price: price,
        cents: cents,
        init: init,
        end: end,
        currency: 57,
        id_replenishment_product:id_replenishment_product
      }
    };
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }


  getByDate(dateIso: string): Observable<any> {
    const url =
      `${this.apiUrl}/replenishment_glp_prices` +
      `?valid_range=cs.${dateIso}` +
      `&order=id.desc` +
      `&limit=1`;

    return this.http
      .get<any[]>(url)
      .pipe(
        map(results => results[0] ?? null)
      );
  }


  getByDate2(date: Date): Observable<any> {
    const iso = date.toISOString(); // genera UTC

    const url =
      `${this.apiUrl}/replenishment_glp_prices` +
      `?valid_range=cs.${iso}` +
      `&order=id.desc` +
      `&limit=1`;

    return this.http
      .get<any[]>(url)
      .pipe(
        map(results => results[0] ?? null)
      );
  }



  getByDateAndProductTambiePorProducto(date: Date, productId: number): Observable<any> {
    const iso = date.toISOString();

    const url =
      `${this.apiUrl}/replenishment_glp_prices` +
      `?data->>id_replenishment_product=eq.${productId}` +
      `&valid_range=cs.${iso}` +
      `&order=id.desc` +
      `&limit=1`;

    return this.http
      .get<any[]>(url)
      .pipe(
        map(results => results[0] ?? null)
      );
  }


  getCurrentYearPrices(): Observable<any[]> {

    const year = new Date().getFullYear();

    const start = `${year}-01-01T00:00:00-05:00`;
    const end   = `${year}-12-31T23:59:59-05:00`;

    const url =
      `${this.apiUrl}/replenishment_glp_prices` +
      `?valid_range=ov.[${start},${end}]` +   
      `&order=id.asc`;

    return this.http.get<any[]>(url);
  }

  checkOverlap(
    productId: number,
    start: string,
    end: string
  ) {
    const range = `[${start},${end}]`;
    const url =
      `${this.apiUrl}/replenishment_glp_prices` +
      `?data->>id_replenishment_product=eq.${productId}` +
      `&valid_range=ov.${range}`;

    return this.http.get<any[]>(url);
  }

  patch(id: number, updatedElement: any) {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    const body = { data: updatedElement };

    return this.http.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }


}








