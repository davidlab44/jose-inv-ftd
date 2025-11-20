import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RexService {

  private apiUrl = environment.apiHost; 

  constructor(private http: HttpClient) {}


  getProdrexList(rexId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/prodrex?data->>rex_id=ilike.*${rexId}*&limit=20`
    );
  }


  addProdrexItems(items: any[]): Observable<any> {
    const url = `${this.apiUrl}/prodrex`;
    return this.http.post(url, items, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

}

