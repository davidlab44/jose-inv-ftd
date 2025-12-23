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


  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rex`);
  }

  getLast(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rex?order=id.desc&limit=1`);
  }

  getProdrexList(rexId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/prodrex?data->>rex_id=ilike.*${rexId}*&limit=20`
    );
  }


  addRex(): Observable<any> {
    const url = `${this.apiUrl}/rex?select=*`;
    const item = {
      status:'draft',
      data: {
        id_user: null,
      }
    };
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }
 



  /*patchRex(rex:any,qty:number): Observable<any> {*/
    /*const url = `${this.apiUrl}/product?select=*`;*/
    /*rex.data.qty = qty;*/
    /*return this.http.patch(url, rex, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json',*/
        /*'Prefer': 'return=representation'*/
      /*}*/
    /*});  */
  /*}*/

  changeUserOwner(){}
  
  markAsDelivered(rex:any){
    //console.log("rex pasadox", rex);
    const url = `${this.apiUrl}/rex?select=*`;
    rex.state = 'delivered';
    console.log("rex que se sendiara",rex);
    return this.http.patch(url, rex, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }); 
  }



}

