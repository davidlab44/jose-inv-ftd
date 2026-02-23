import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiHost; 
  private cache: any[] | null = null;
  private storageKey = 'productos_cache';

  private productos$ = new BehaviorSubject<any[] | null>(null);

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.cache = JSON.parse(data);
      this.productos$.next(this.cache);
    }
  }

  private saveToStorage(data: any[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // 🔵 LLAMADA AL SERVIDOR (solo para Page A)
  refreshFromServer() {
    return this.http.get<any[]>(`${this.apiUrl}/product`).pipe(
      tap(resp => {
        this.cache = resp;          // guarda en memoria
        this.saveToStorage(resp);   // guarda para sobrevivir F5
        this.productos$.next(resp); // actualiza observadores
      })
    );
  }

  // 🟢 Page B usa esto → NO refresca
  getCachedOrServer() {
    if (this.cache) {
      return of(this.cache); // referencia directa
    }
    return this.refreshFromServer(); // solo si no hay cache
  }

  // opcional: observable en vivo
  get productosObservable() {
    return this.productos$.asObservable();
  }

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

  getProductByBarcode(barcode: number): Observable<any> {
    const url = `${this.apiUrl}/product?data->>barcode=eq.${barcode}&limit=1`;
    return this.http.get<any[]>(url);
  }

  post(data:any): Observable<any> {
    const url = `${this.apiUrl}/product?select=*`;
    const item = {
      data: data
    };
    return this.http.post(url, item, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  updateProductQty(id: number, updatedProduct: any): Observable<any> {
    //console.log('request updateProductQty',updatedProduct);
    const url = `${this.apiUrl}/product?id=eq.${id}`;
    const body = { data: updatedProduct.data };
    console.log('request url',url)
    console.log('request id',id)
    console.log('request body',body)
    return this.http.patch(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  patch(id: number, updatedElement: any): Observable<any> {
    const url = `${this.apiUrl}/product?id=eq.${id}`;
    const body = {
      data: updatedElement
    };
    console.log("request patch body",body)
    return this.http.patch(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
  }

  delete(id: number): Observable<any> {
    const url = `${this.apiUrl}/product?id=eq.${id}`;
    return this.http.delete(url, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  
}

