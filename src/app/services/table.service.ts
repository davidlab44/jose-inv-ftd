import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private API_URL = environment.apiHost;
  constructor(private http: HttpClient) { }

  public getTables(number:number,string:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
          "service": "object",
          "method": "execute_kw",
          "args": [
              environment.db,
              number,
              string,
              "restaurant.table",
              "search_read",
              [[], ["id", "floor_id","name"]],
              {}
          ]
      },
      "id": 1
    };
    return this.http.post<any>(this.API_URL, body);
  }

  
}
