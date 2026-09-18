import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
//import * as shared from './prodrex.service.js';

//declare const require:any; 
//const shared=require('./prodrex.service.js');

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



  urlAllProducts(limit = 20): string {
    console.log("apiUrl  URL URL URL URL URL URL URL URL URL URL URL URL URLURL")
    console.log("apiUrl  URL URL URL URL URL URL URL URL URL URL URL URL URLURL",this.apiUrl)
    return `${this.apiUrl}/prodrex?limit=${limit}`;
  }
  private urlLastProducts(limit = 20): string {
    return `${this.apiUrl}/prodrex?order=id.desc&limit=${limit}`;
  }
  private urlNext20Desc(since_id: number, limit = 20): string {
    return `${this.apiUrl}/prodrex?id=lt.${since_id}&order=id.desc&limit=${limit}`;
  }
  getRecents(limit = 20): Observable<any[]> {
    return this.http.get<any[]>(this.urlLastProducts(limit));
  }


  /*getRecents(limit = 20): Observable<any[]> {*/
  /*return this.http.get<any[]>(*/
    /*shared.urlLastProducts(this.apiUrl, limit)*/
  /*);*/
/*}*/

/*getNext20Desc(since_id: number, limit = 20): Observable<any[]> {*/
  /*return this.http.get<any[]>(*/
    /*shared.urlNext20Desc(this.apiUrl, since_id, limit)*/
  /*);*/
/*}*/




    /*getAllProducts(limit=20):Observable<any[]>{*/
      /*return this.http.get<any[]>(shared.urlAllProducts(this.apiUrl,limit));                                                                          */
    /*}*/





  addProdrexItem(productId: number,qty:number,rexDocumentId:number): Observable<any> {
    console.log("id pasado", productId);
    console.log("rexDocument10 id pasado", rexDocumentId);
    const url = `${this.apiUrl}/prodrex?select=*`;
    const item = {
      data: {
        id_product: productId,
        id_rex: rexDocumentId,
        qty:qty,
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

  removeFromProdrex(id: number): Observable<any> {
    const url = `${this.apiUrl}/prodrex?id=eq.${id}`;
    return this.http.delete(url, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

}
