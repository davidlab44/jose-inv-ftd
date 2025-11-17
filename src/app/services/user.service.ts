import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  
  private API_URL = environment.apiHost;

  constructor(private http: HttpClient) { }

  public fetchUserData(id:number,p:string): Observable<any> {
    // console.log("id: ",id)
    // console.log("p: ",p)
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
          "service": "object",
          "method": "execute_kw",
          "args": [
              environment.db,
              id,
              p,
              "res.users",
              "search_read",
              [[["id", "=", id]], ["login", "email", "name", "im_hr", "have_a_workspace"]],
              {}
          ]
      },
      "id": 2
  };
    return this.http.post<any>(this.API_URL, body);
  }


  public fetchBasicUserData(id:number,p:string,user_id:number): Observable<any> {
    // console.log("id: ",id)
    // console.log("p: ",p)
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
          "service": "object",
          "method": "execute_kw",
          "args": [
              environment.db,
              id,
              p,
              "res.users",
              "search_read",
              [[["id", "=", user_id]], ["login", "email", "partner_id","name", "im_hr", "have_a_workspace"]],
              {}
          ]
      },
      "id": 2
  };
    return this.http.post<any>(this.API_URL, body);
  }

  public fetchUserDataByPartnerId(id:number,p:string,partner_id:number): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          p,
          "res.partner",
          "search_read",
          [[["id", "=", partner_id]]],
          {
            "fields": ["name","email", "street", "street2", "phone", "category_id", "image_1920", "title"]
          }
        ]
      },
      "id": 3
    }
    ;
    return this.http.post<any>(this.API_URL, body);
  }

  public retrieveMyResPartnerAsociado(id:number,p:string): Observable<any> {
    
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,       // Database name
          id,            // User ID
          p,        // User password
          "res.users",            // Model name
          "search_read",          // Method to call
          [
            [["id", "=", id]],                   // Domain filter (empty to retrieve all users)
            ["id", "partner_id"]  // Fields to retrieve: user ID and associated partner ID
          ],
          {}                      // Additional keyword arguments (empty in this case)
        ],
        "id": 1                   // Request ID
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public getAllUsers(number:number,string:string): Observable<any> {
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
          "res.users",
          "search_read",
          [
            [],
            ["id", "name", "partner_id"]
          ],
          {}
        ]
      },"id": 2
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public getTodosLosPartners(number:number,string:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
          "service": "object",
          "method": "execute_kw",
          "args": [
              environment.db,
              2,
              "LAfacil123-.-",
              "res.partner",
              "search_read",
              [[],["name","email","image_1920","title"]],
              {}
          ]
      },
      "id": 1
    };
    console.log('getTodosLosPartners body : ',body)
    return this.http.post<any>(this.API_URL, body);
  }


}
