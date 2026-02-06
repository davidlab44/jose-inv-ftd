import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
   
@Injectable({
  providedIn: 'root'
})
export class ReplenishmentService {
  private apiUrl = environment.apiHost; 
      
  constructor(private http: HttpClient) {}   
      
  getAll(): Observable<any[]> {   
    return this.http.get<any[]>(`${this.apiUrl}/replenishment_replenishment`);
  }   

  postReplenishment(data:any): Observable<any> {
    const url = `${this.apiUrl}/replenishment_replenishment?select=*`;
    const item = {
      data: data
    };
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }



  patch(id: number, updatedElement: any): Observable<any> {
    const url = `${this.apiUrl}/replenishment_replenishment?id=eq.${id}`;
    
    const body = {
      data: updatedElement   // updatedElement ES la data, NO el objeto completo
    };

    return this.http.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }


  

  /*patch(id: number, updatedElement: any): Observable<any> {*/
    /*const url = `${this.apiUrl}/replenishment_replenishment?id=eq.${id}`;*/
    /*//const body = { data: updatedElement };*/
    /*const body = updatedElement ;*/
    /*console.log("body",body)*/
    /*return this.http.patch(url, body, {*/
      /*headers: { 'Content-Type': 'application/json' }*/
    /*});*/
  /*}*/

  removeFromProdrex(id: number): Observable<any> {
    const url = `${this.apiUrl}/replenishment_replenishment?id=eq.${id}`;
    return this.http.delete(url, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


}
