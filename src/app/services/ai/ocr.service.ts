import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  private ocrUrl = environment.ocrUrl;

  constructor(private http: HttpClient) {}

  /**
   * OCR Vendor document
   */
  postVendor(imageUrl: string): Observable<any> {
    const body = {
      url: imageUrl
    };

    return this.http.post(`${this.ocrUrl}/post-vendor`, body);
  }

  /**
   * OCR IN document
   */
  postIn(imageUrl: string): Observable<any> {
    const body = {
      url: imageUrl
    };

    return this.http.post(`${this.ocrUrl}/post-in`, body);
  }

  /**
   * OCR OUT document
   */
  postOut(imageUrl: string): Observable<any> {
    const body = {
      url: imageUrl
    };
    return this.http.post(`${this.ocrUrl}/post-out`, body);
  }

  /**
   * OCR SCALE document
   */
  postScale(imageUrl: string): Observable<any> {
    const body = {
      url: imageUrl
    };
    return this.http.post(`${this.ocrUrl}/post-scale`, body);
  }

}




