import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProdrexService {

  private apiUrl = environment.apiHost; 
  private cache: any[] | null = null;
  private storageKey = 'productos_cache';
  private productos$ = new BehaviorSubject<any[] | null>(null);

  constructor(private http: HttpClient) {
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/prodrex`);
  }
 
  addProdrexItem(productId: number,rexDocumentId:number): Observable<any> {
    console.log("id pasado", productId);
    console.log("rexDocument10 id pasado", rexDocumentId);
    const url = `${this.apiUrl}/prodrex?select=*`;
    const item = {
      data: {
        id_product: productId,
        id_rex: rexDocumentId
      }
    };
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  addProdrexItems(items: any[]): Observable<any> {
    console.log("request",items)
    const url = `${this.apiUrl}/prodrex`;
    return this.http.post(url, items, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }


}
