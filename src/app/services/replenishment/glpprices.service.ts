  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { environment } from '../../../environments/environment';
  import { map } from 'rxjs/operators';
                                                                                                                                            
  @Injectable({
    providedIn: 'root'         
  })
  export class GlppricesService {
    
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

    addGlpprice(price: number,init:string,end:string,id_replenishment_product:number): Observable<any> {
      const url = `${this.apiUrl}/replenishment_glp_prices?select=*`;
      const item = {
        data: {
          price: price,
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




}
