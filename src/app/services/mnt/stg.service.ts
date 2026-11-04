/*import { Injectable } from '@angular/core';*/

/*@Injectable({*/
  /*providedIn: 'root'*/
/*})*/
/*export class StgService {*/

  /*constructor() { }*/
/*}*/


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StgService {

  private apiUrl = environment.pimApiHost;
  private cache: any[] | null = null;
  private storageKey = 'productos_cache';
  private productos$ = new BehaviorSubject<any[] | null>(null);
  private model:string='mnt_stg'

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.model}`);
  }

  urlAllProducts(limit = 20): string {
    return `${this.apiUrl}/${this.model}?limit=${limit}`;
  }

  private urlLastProducts(limit = 20): string {
    return `${this.apiUrl}/${this.model}?order=id.desc&limit=${limit}`;
  }

  private urlNext20Desc(since_id: number, limit = 20): string {
    return `${this.apiUrl}/${this.model}?id=lt.${since_id}&order=id.desc&limit=${limit}`;
  }

  getRecents(limit = 20): Observable<any[]> {
    return this.http.get<any[]>(this.urlLastProducts(limit));
  }

  post(data:any): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?select=*`;
    const item = {
      data: data
    };
    return this.http.post(url, item, {
      headers: {'Content-Type': 'application/json','Prefer': 'return=representation'}
    });
  }

  addProdrexItems(items: any[]): Observable<any> {
    console.log("request",items)
    const url = `${this.apiUrl}/${this.model}`;
    return this.http.post(url, items, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?id=eq.${id}`;
    return this.http.delete(url, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


}

