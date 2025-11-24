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

  getProdrexList(rexId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/prodrex?data->>rex_id=ilike.*${rexId}*&limit=20`
    );
  }

  addUserOwner(rex:any,id_user:number): Observable<any> {
    console.log("rex pasadox", rex);
    console.log("id_product pasadox", id_user);
    const url = `${this.apiUrl}/rex?select=*`;
    rex.data.id_user = id_user;
    console.log("rex que se enviara",rex);
    return this.http.patch(url, rex, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }


/*  addProdrexItem(id: number,rexId:number): Observable<any> {*/
    /*console.log("id pasado", id);*/
    /*console.log("rexDocument3 id pasado", rexId);*/
    /*const url = `${this.apiUrl}/prodrex?select=*`;*/
    /*const item = {*/
      /*data: {*/
        /*id_product: id,*/
        /*id_rex: rexId*/
      /*}*/
    /*};*/
    /*return this.http.post(url, item, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json',*/
        /*'Prefer': 'return=representation'*/
      /*}*/
    /*});*/
  /*}*/

  /*addProdrexItems(items: any[]): Observable<any> {*/
    /*console.log("request",items)*/
    /*const url = `${this.apiUrl}/prodrex`;*/
    /*return this.http.post(url, items, {*/
      /*headers: {*/
        /*'Content-Type': 'application/json'*/
      /*}*/
    /*});*/
  /*}*/

}

