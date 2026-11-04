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
export class  TService{

  private apiUrl = environment.pimApiHost;
  private model = 'mnt_t';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.model}`);
  }

  getOne(id: number): Observable<any> {
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

  //COMO USAR MI CUSTOM METODO PATCH_DATA_ATTRIB
  /*curl -i -X POST 'https://bk-test.axap.org/rpc/patch_data_attribute' \*/
  /*-H 'Content-Type: application/json' \*/
  /*-H 'Prefer: return=representation' \*/
  /*-d '{*/
    /*"p_table": "usr",*/
    /*"p_id": 6,*/
    /*"p_attribute": "ctg",*/
    /*"p_value": 15*/
  /*}'*/
  patchDataAttribute(table: string, id: number, attribute: string, value: any): Observable<any> {
    const url = `${this.apiUrl}/rpc/patch_data_attribute`;
    const body = { p_table: table, p_id: id, p_attribute: attribute, p_value: value };
    console.log('urlpatchdataatttrib',url)
    console.log('bodypatchdataattrib',body)
    return this.http.post(url, body, {
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







