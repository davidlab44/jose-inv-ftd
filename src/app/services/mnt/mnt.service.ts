import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class  MntService{

  private apiUrl = environment.pimApiHost;
  private model = 'mnt';

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
        map(response => response ?? [])
      );
  }

  post(data:any): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?select=*`;
    const item = {
      data: data
    };
    console.log('url',url);
    console.log('item',item);
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  postDataList(list: any[]): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?select=*`;
    const items = list.map((data) => ({
      data: data
    }));
    console.log('postList url',url)
    console.log('items',items)
    return this.http.post(url, items, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }



  postDataListStrgth(list: any[]): Observable<any> {
    const url = `${this.apiUrl}/${this.model}?select=*`;

    const items = list.map((item) => ({
      data: item
    }));

    console.log('postList url', url);
    console.log('items', items);

    return this.http.post(url, items, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  /*postDataListStrgth(list: any[]): Observable<any> {*/
    /*const url = `${this.apiUrl}/${this.model}?select=*`;*/
    /*console.log('postList url', url);*/
    /*console.log('items', list);*/
    /*return this.http.post(url, list, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json',*/
        /*'Prefer': 'return=representation'*/
      /*}*/
    /*});*/
  /*}*/

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

}

