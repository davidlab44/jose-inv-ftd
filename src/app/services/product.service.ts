import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiHost; 

  constructor(private http: HttpClient) {}

   getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/product`);
   }
  
   getAllProducts(limit = 20): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/product?limit=${limit}`);
   }

  searchProducts(hash: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/product?datos->>name=ilike.*${hash}*&limit=20`
      // `${this.apiUrl}/product?datos->>name=ilike.*${hash}*`
    );
  }

  getProductById(id: number): Observable<any> {
    const url = `${this.apiUrl}/product?id=eq.${id}`;
    return this.http.get<any[]>(url);
  }

  updateProductQty(id: number, updatedProduct: any): Observable<any> {
    const url = `${this.apiUrl}/product?id=eq.${id}`;
    const body = { datos: updatedProduct.datos };
    return this.http.patch(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }


}

