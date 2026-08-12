import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  //private apiUrl = environment.apiHost; // https://invapi.chrisantemogourmet.com
  private apiUrl = environment.pimApiHost; 
  private entity = "categ";
  
  constructor(private http: HttpClient) {}

  // 🔹 Obtener todas las categorías
  getAllCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/${this.entity}`);
  }

  // 🔹 Obtener una categoría por id
  getCategById(id: number): Observable<any> {
    const url = `${this.apiUrl}/${this.entity}?id=eq.${id}`;
    return this.http.get<any[]>(url);
  }

  saveCategoriesToLocal(categories: any[]): void {
    localStorage.setItem('categories', JSON.stringify(categories));
  }

  getCategoriesFromLocal(): any[] {
    const data = localStorage.getItem('categories');
    return data ? JSON.parse(data) : [];
  }

}




