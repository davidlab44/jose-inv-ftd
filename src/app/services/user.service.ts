import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  
  private apiUrl = environment.apiHost;

  constructor(private http: HttpClient) { }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getById(id: number): Observable<any> {
    const url = `${this.apiUrl}/users?id=eq.${id}`;
    return this.http.get<any[]>(url);
  }

  compare(users:any,email:string,pwd:string):any{
    users.forEach(user => {
      if(user.data.email==email&&user.data.pwd==pwd){
       try {
          if (user.result && user.result.length > 0) {
            localStorage.setItem('storedObject', JSON.stringify(user));
          } else {
            console.error('No result found in the response');
          }
        } catch (error) {
          console.error('Error retrieving user info:', error);
        }
        return true;
      }
    });
    return null;
  }

  public async onLogin(email:string,pwd:string): Promise<any> {
    const users = this.getAll();
    const user = this.compare(users,email,pwd);
  }

  public getStoredUserInfo(): any {
    const storedObject = localStorage.getItem('storedObject');
    return storedObject ? JSON.parse(storedObject) : null;
  }


}
