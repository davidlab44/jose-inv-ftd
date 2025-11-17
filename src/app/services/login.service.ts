import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  public login(email:string,pass:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
          "service": "common",
          "method": "authenticate",
          "args": [
              environment.db,     
              email, 
              pass,
              {}
          ]
      },
      "id": 2
    };
    return this.http.post<any>(environment.apiHost, body);
  }

  public retrieveUserData(id:string,p:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,  // Nombre de la base de datos
          id,        // ID del usuario o token de autenticación
          p,         // Contraseña o clave del usuario
          "res.users",  // Modelo
          "search_read",  // Método
          [[["id", "=", id]], ["login", "email", "name", "company_id"]], // Campos
          {}
        ]
      },
      "id": 2
    };
    return this.http.post<any>(environment.apiHost, body);
  }
}