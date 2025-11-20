import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
      `${this.apiUrl}/product?data->>name=ilike.*${hash}*&limit=20`
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

