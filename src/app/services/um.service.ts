import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UmService {

  private apiUrl = environment.apiHost; // https://invapi.chrisantemogourmet.com

  constructor(private http: HttpClient) {}

  // 🔹 Obtener todas las categorías
  getAllUms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/um`);
  }

  // 🔹 Obtener una categoría por id
  getUmById(id: number): Observable<any> {
    const url = `${this.apiUrl}/um?id=eq.${id}`;
    return this.http.get<any[]>(url);
  }

  saveUmsToLocal(ums: any[]): void {
    localStorage.setItem('ums', JSON.stringify(ums));
  }

  getUmsFromLocal(): any[] {
    const data = localStorage.getItem('ums');
    return data ? JSON.parse(data) : [];
  }

}


