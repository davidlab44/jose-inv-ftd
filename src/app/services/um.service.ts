import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
declare const require:any;
const shared=require('./um.service.js');
@Injectable({providedIn:'root'})
export class UmService {
  private apiUrl=environment.apiHost;
  constructor(private http:HttpClient){}
  getAllUms():Observable<any>{return this.http.get(shared.urlAllUms(this.apiUrl));}
  getUmById(id:number):Observable<any>{return this.http.get<any[]>(shared.urlUmById(this.apiUrl,id));}
  saveUmsToLocal(ums:any[]):void{localStorage.setItem('ums',JSON.stringify(ums));}
  getUmsFromLocal():any[]{const data=localStorage.getItem('ums');return data?JSON.parse(data):[];}
}
