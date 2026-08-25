import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
declare const require:any;
const shared=require('./category.service.js');
@Injectable({providedIn:'root'})
export class CategoryService {
  private apiUrl=environment.pimApiHost;
  constructor(private http:HttpClient){}
  getAllCategories():Observable<any>{return this.http.get(shared.urlAllCategories(this.apiUrl));}
  getCategById(id:number):Observable<any>{return this.http.get<any[]>(shared.urlCategById(this.apiUrl,id));}
  saveCategoriesToLocal(categories:any[]):void{localStorage.setItem('categories',JSON.stringify(categories));}
  getCategoriesFromLocal():any[]{const data=localStorage.getItem('categories');return data?JSON.parse(data):[];}
}
