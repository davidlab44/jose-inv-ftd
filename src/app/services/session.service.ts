import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';



import { map } from 'rxjs';
import { ProductData } from '../interfaces/opportunity';


import { mapToSession, Session } from '../interfaces/session';


@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient) { }


  public getActiveSession(userId: number, password: string): Observable<Session | null> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          userId,
          password,
          "pos.session",
          "search_read",
          [
            [
              ["state", "=", "opened"]  // sesiones abiertas
            ],
            ["id", "name", "user_id", "config_id", "state"]
          ],
          { "limit": 1 }
        ]
      }
    };

    return this.http.post<any>(environment.apiHost, body).pipe(
      map(res => {
        if (!res?.result?.length) {
          return null; // no hay sesión abierta
        }
        const s = res.result[0];
        const session: Session = {
          id: s.id,
          name: s.name,
          user_id: { id: s.user_id[0], name: s.user_id[1] },
          config_id: { id: s.config_id[0], name: s.config_id[1] },
          state: s.state
        };
        return session;
      })
    );
  }


}
