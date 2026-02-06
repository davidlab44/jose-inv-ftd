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


  getAllOrderByDesc(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rex`);
  }

  /*getLastOne(): Observable<any[]> {*/
    /*return this.http.get<any[]>(*/
      /*`${this.apiUrl}/rex?order=id.desc&limit=1`*/
    /*);*/
  /*}*/

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
      state:'draft',
      data: {
        id_user: null,
      }
    };
    console.log('url',url)
    console.log('item',item)
    return this.http.post(url, item, {
         headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }
 
  /*addUserOwner(rex: any, id_user: number): Observable<any> {*/

  /*// WHERE id = 1 (hardcoded)*/
  /*const url = `${this.apiUrl}/rex?id=eq.1&select=*`;*/

  /*// Solo enviar los campos que se van a actualizar*/
  /*const body = {*/
    /*id_user: id_user*/
  /*};*/

  /*return this.http.patch(url, body, {*/
    /*headers: {*/
      /*'Content-Type': 'application/json',*/
      /*'Prefer': 'return=representation'*/
    /*}*/
  /*});*/
/*}*/

  /*addUserOwner(body:any,id_user:number): Observable<any> {*/
    /*const url = `${this.apiUrl}/rex?id=eq.${body.id}&select=*`;*/
    /*body.data.id_user = id_user;*/
    /*return this.http.patch(url, body, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json',*/
        /*'Prefer': 'return=representation'*/
      /*}*/
    /*});*/
  /*}*/



  addUserOwner(rexId: number, id_user: number): Observable<any> {

    console.log('rexid request',rexId)
    console.log('iduser request',id_user)
    const url = `${this.apiUrl}/rex?id=eq.${rexId}&select=*`;

    const body = {
      data: {
        id_user: id_user
      }
    };

    return this.http.patch(url, body, {
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

  markAsDelivered(id: number,newState:string) {
    const url = `${this.apiUrl}/rex?id=eq.${id}&select=*`;
    const body = {
      state: newState
    };
    return this.http.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  /*markAsDelivered(rex:any){*/
    /*const url = `${this.apiUrl}/rex?select=*`;*/
    /*rex.state = 'delivered';*/
    /*//console.log("rex que se sendiara",rex);*/
    /*return this.http.patch(url, rex, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json',*/
        /*'Prefer': 'return=representation'*/
      /*}*/
    /*}); */
  /*}*/


}

