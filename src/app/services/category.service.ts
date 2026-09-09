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

  getUmNameById(id: number | string | null | undefined, umList:any[]): string {
    if (id === null || id === undefined) {
      return 'Sin categ1';
    }
    const idNum = Number(id);
    if (isNaN(idNum)) {
      return 'Sin categ2';
    }
    if (!Array.isArray(umList) || umList.length === 0) {
      return 'Sin categ3';
    }
    const um = umList.find(u => Number(u.id) === idNum);
    if (!um) {
      return 'Sin categ4';
    }
    const nombre = um?.data?.name;
    if (typeof nombre === 'string' && nombre.trim() !== '') {
      return nombre;
    }
    return 'Sin categ5';
  }



}
