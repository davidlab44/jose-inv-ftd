import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
declare const require:any;
const shared=require('./product.service.js');
@Injectable({providedIn:'root'})
export class ProductService {
  private apiUrl=environment.pimApiHost; private cache:any[]|null=null; private storageKey='productos_cache'; private productos$=new BehaviorSubject<any[]|null>(null);
  constructor(private http:HttpClient){this.loadFromStorage();}
  private loadFromStorage(){const data=localStorage.getItem(this.storageKey);if(data){this.cache=JSON.parse(data);this.productos$.next(this.cache);}}
  private saveToStorage(data:any[]){localStorage.setItem(this.storageKey,JSON.stringify(data));}
  refreshFromServer(){return this.http.get<any[]>(shared.urlAll(this.apiUrl)).pipe(tap(resp=>{this.cache=resp;this.saveToStorage(resp);this.productos$.next(resp);}));}
  getCachedOrServer(){return this.cache?of(this.cache):this.refreshFromServer();}
  get productosObservable(){return this.productos$.asObservable();}
  getAll():Observable<any[]>{return this.http.get<any[]>(shared.urlAll(this.apiUrl));}
  getAllProducts(limit=20):Observable<any[]>{return this.http.get<any[]>(shared.urlAllProducts(this.apiUrl,limit));}
  searchProducts(hash:string):Observable<any[]>{return this.http.get<any[]>(shared.urlSearch(this.apiUrl,hash));}
  getProductById(id:number):Observable<any>{return this.http.get<any[]>(shared.urlById(this.apiUrl,id));}
  getProductByBarcode(barcode:number):Observable<any>{return this.http.get<any[]>(shared.urlByBarcode(this.apiUrl,barcode));}
  post(data:any):Observable<any>{return this.http.post(`${shared.urlAll(this.apiUrl)}?select=*`,{data},{headers:{'Content-Type':'application/json','Prefer':'return=representation'}});}
  updateProductQty(id:number,p:any):Observable<any>{return this.http.patch(shared.urlById(this.apiUrl,id),{data:p.data},{headers:{'Content-Type':'application/json'}});}
  patch(id:number,data:any):Observable<any>{return this.http.patch(shared.urlById(this.apiUrl,id),{data},{headers:{'Content-Type':'application/json','Prefer':'return=representation'}});}
  delete(id:number):Observable<any>{return this.http.delete(shared.urlById(this.apiUrl,id),{headers:{'Content-Type':'application/json'}});}
}
