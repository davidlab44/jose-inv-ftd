import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OcrService {

  private ocrUrl = environment.ocrUrl;
  private vsnUrl = environment.vsn;



  constructor(private http: HttpClient) {}



  postVsn(imageBase64: string): Observable<any> {
    return this.http.post<any>(
      `${environment.vsn}/ocr`,
      { image: imageBase64 }
    );
  }


  postVendor(imageBase64: string): Observable<any> {
    return this.http.post<any>(
      `${environment.vsn}/post-vendor`,
      { image: imageBase64 }
    );
  }


  postIn(imageBase64: string): Observable<any> {
    return this.http.post<any>(
      `${environment.vsn}/post-in`,
      { image: imageBase64 }
    );
  }


  postOut(imageBase64: string): Observable<any> {
    return this.http.post<any>(
      `${environment.vsn}/post-out`,
      { image: imageBase64 }
    );
  }


  postScale(imageBase64: string): Observable<any> {
    return this.http.post<any>(
      `${environment.vsn}/post-scale`,
      { image: imageBase64 }
    );
  }

  /*postVendor(imageUrl: string): Observable<any> {*/
    /*const body = {*/
      /*url: imageUrl*/
    /*};*/

    /*return this.http.post(`${this.ocrUrl}/post-vendor`, body);*/
  /*}*/

  /*postIn(imageUrl: string): Observable<any> {*/
    /*const body = {*/
      /*url: imageUrl*/
    /*};*/

    /*return this.http.post(`${this.ocrUrl}/post-in`, body);*/
  /*}*/

/*  postOut(imageUrl: string): Observable<any> {*/
    /*const body = {*/
      /*url: imageUrl*/
    /*};*/
    /*return this.http.post(`${this.ocrUrl}/post-out`, body);*/
  /*}*/

  /*postScale(imageUrl: string): Observable<any> {*/
    /*const body = {*/
      /*url: imageUrl*/
    /*};*/
    /*return this.http.post(`${this.ocrUrl}/post-scale`, body);*/
  /*}*/







/*async testOcr(): Promise<void> {*/
  /*const start = performance.now();*/

  /*console.log('[OCR TEST] INICIO');*/

  /*try {*/
    /*const imageResponse = await fetch('/assets/ocr-test.jpg');*/

    /*if (!imageResponse.ok) {*/
      /*throw new Error(`Imagen HTTP ${imageResponse.status}`);*/
    /*}*/

    /*const blob = await imageResponse.blob();*/

    /*console.log('[OCR TEST] Imagen:', blob.size, 'bytes');*/

    /*const base64 = await new Promise<string>((resolve, reject) => {*/
      /*const reader = new FileReader();*/

      /*reader.onload = () => resolve(reader.result as string);*/
      /*reader.onerror = () => reject(reader.error);*/

      /*reader.readAsDataURL(blob);*/
    /*});*/

    /*console.log('[OCR TEST] Base64:', base64.length);*/
    /*console.log('[OCR TEST] Enviando POST');*/

    /*const requestStart = performance.now();*/

    /*const response = await fetch(`${this.vsnUrl}/ocr`, {*/
      /*method: 'POST',*/
      /*headers: {*/
        /*'Content-Type': 'application/json'*/
      /*},*/
      /*body: JSON.stringify({ image: base64 })*/
    /*});*/

    /*console.log('[OCR TEST] HTTP:', response.status);*/
    /*console.log(*/
      /*'[OCR TEST] Tiempo HTTP:',*/
      /*((performance.now() - requestStart) / 1000).toFixed(2),*/
      /*'s'*/
    /*);*/

    /*const text = await response.text();*/

    /*if (!response.ok) {*/
      /*console.error('[OCR TEST] Error HTTP:', text.slice(0, 1000));*/
      /*return;*/
    /*}*/

    /*const data = JSON.parse(text);*/

    /*console.log('[OCR TEST] RESPUESTA:', data);*/

  /*} catch (error) {*/
    /*console.error('[OCR TEST] ERROR:', error);*/
  /*} finally {*/
    /*console.log(*/
      /*'[OCR TEST] TOTAL:',*/
      /*((performance.now() - start) / 1000).toFixed(2),*/
      /*'s'*/
    /*);*/
  /*}*/
/*}*/




/*async testOcr(): Promise<void> {*/
  /*const url = `${this.vsnUrl}/ocr`;*/
  /*const start = performance.now();*/

  /*console.log('========== OCR DEBUG ==========');*/
  /*console.log('[OCR] URL:', url);*/
  /*console.log('[OCR] Origen:', window.location.origin);*/
  /*console.log('[OCR] Navegador:', navigator.userAgent);*/
  /*console.log('[OCR] Online:', navigator.onLine);*/
  /*console.log('[OCR] Service Worker:', navigator.serviceWorker?.controller?.scriptURL ?? 'Ninguno');*/

  /*try {*/
    /*const imageResponse = await fetch('/assets/ocr-test.jpg');*/
    /*if (!imageResponse.ok) {*/
      /*throw new Error(`Imagen HTTP ${imageResponse.status}`);*/
    /*}*/

    /*const blob = await imageResponse.blob();*/

    /*const base64 = await new Promise<string>((resolve, reject) => {*/
      /*const reader = new FileReader();*/

      /*reader.onload = () => resolve(reader.result as string);*/
      /*reader.onerror = () => reject(reader.error);*/

      /*reader.readAsDataURL(blob);*/
    /*});*/

    /*const body = JSON.stringify({ image: base64 });*/

    /*console.log('[OCR] Imagen bytes:', blob.size);*/
    /*console.log('[OCR] Base64 length:', base64.length);*/
    /*console.log('[OCR] JSON bytes:', new Blob([body]).size);*/

    /*const requestStart = performance.now();*/

    /*console.log('[OCR] POST iniciado:', new Date().toISOString());*/

    /*const response = await fetch(url, {*/
      /*method: 'POST',*/
      /*mode: 'cors',*/
      /*cache: 'no-store',*/
      /*headers: {*/
        /*'Content-Type': 'application/json'*/
      /*},*/
      /*body*/
    /*});*/

    /*const elapsed = performance.now() - requestStart;*/

    /*console.log('========== HTTP RESPONSE ==========');*/
    /*console.log('[HTTP] Status:', response.status);*/
    /*console.log('[HTTP] StatusText:', response.statusText);*/
    /*console.log('[HTTP] OK:', response.ok);*/
    /*console.log('[HTTP] URL:', response.url);*/
    /*console.log('[HTTP] Type:', response.type);*/
    /*console.log('[HTTP] Redirected:', response.redirected);*/
    /*console.log('[HTTP] Tiempo:', (elapsed / 1000).toFixed(3), 's');*/

    /*console.log('[HTTP] Headers:');*/
    /*response.headers.forEach((value, key) => {*/
      /*console.log(`  ${key}: ${value}`);*/
    /*});*/

    /*const text = await response.text();*/

    /*console.log('[HTTP] Response length:', text.length);*/
    /*console.log('[HTTP] Response preview:', text.substring(0, 500));*/

    /*const entries = performance.getEntriesByName(url, 'resource') as PerformanceResourceTiming[];*/
    /*const timing = entries[entries.length - 1];*/

    /*if (timing) {*/
      /*console.log('========== NETWORK TIMING ==========');*/
      /*console.log('[NET] Protocol:', timing.nextHopProtocol || 'No disponible');*/
      /*console.log('[NET] DNS:', timing.domainLookupEnd - timing.domainLookupStart, 'ms');*/
      /*console.log('[NET] TCP:', timing.connectEnd - timing.connectStart, 'ms');*/
      /*console.log('[NET] TTFB:', timing.responseStart - timing.requestStart, 'ms');*/
      /*console.log('[NET] Transfer:', timing.responseEnd - timing.responseStart, 'ms');*/
      /*console.log('[NET] Duration:', timing.duration, 'ms');*/
      /*console.log('[NET] TransferSize:', timing.transferSize);*/
      /*console.log('[NET] EncodedSize:', timing.encodedBodySize);*/
    /*}*/

    /*if (response.ok) {*/
      /*console.log('[OCR] RESULTADO:', JSON.parse(text));*/
    /*} else {*/
      /*console.error('[OCR] ERROR HTTP:', response.status);*/
    /*}*/

  /*} catch (error) {*/
    /*console.error('[OCR] EXCEPCIÓN:', error);*/
  /*} finally {*/
    /*console.log('[OCR] TOTAL:', ((performance.now() - start) / 1000).toFixed(3), 's');*/
    /*console.log('========== FIN OCR DEBUG ==========');*/
  /*}*/
/*}*/






async testOcr(): Promise<void> {
  const url = `${this.vsnUrl}/ocr?ngsw-bypass=true`;
  const start = performance.now();

  console.log('========== OCR DEBUG ==========');
  console.log('[OCR] URL destino:', url);
  console.log('[OCR] Origen:', window.location.origin);
  console.log('[OCR] Navegador:', navigator.userAgent);
  console.log('[OCR] Service Worker:', navigator.serviceWorker?.controller?.scriptURL ?? 'Ninguno');

  try {
    const imageResponse = await fetch('/assets/ocr-test.jpg');

    if (!imageResponse.ok) {
      throw new Error(`No se pudo cargar la imagen: HTTP ${imageResponse.status}`);
    }

    const blob = await imageResponse.blob();

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);

      reader.readAsDataURL(blob);
    });

    const payload = { image: base64 };
    const body = JSON.stringify(payload);

    const payloadSummary = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        image: `${base64.substring(0, 65)}...[BASE64 OMITIDO]...${base64.slice(-30)}`
      },
      imageBytes: blob.size,
      base64Length: base64.length,
      jsonBytes: new Blob([body]).size
    };

    console.log('========== REQUEST ==========');
    console.log('[REQUEST] Resumen:', JSON.stringify(payloadSummary, null, 2));
    console.log('[REQUEST] Fecha:', new Date().toISOString());

    const requestStart = performance.now();

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });

    const elapsed = performance.now() - requestStart;

    console.log('========== HTTP RESPONSE ==========');
    console.log('[HTTP] Status:', response.status);
    console.log('[HTTP] StatusText:', response.statusText);
    console.log('[HTTP] OK:', response.ok);
    console.log('[HTTP] URL:', response.url);
    console.log('[HTTP] Type:', response.type);
    console.log('[HTTP] Redirected:', response.redirected);
    console.log('[HTTP] Tiempo:', (elapsed / 1000).toFixed(3), 's');

    const headers: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log('[HTTP] Headers:', JSON.stringify(headers, null, 2));

    // Leer el cuerpo incluso cuando HTTP no sea 200.
    const responseText = await response.text();

    console.log('========== RESPONSE BODY ==========');
    console.log('[BODY] Longitud:', responseText.length);
    console.log('[BODY] Contenido completo:', responseText);

    let responseJson: any = null;

    if (responseText.trim()) {
      try {
        responseJson = JSON.parse(responseText);
        console.log('[BODY] JSON:', responseJson);
      } catch {
        console.warn('[BODY] La respuesta no es JSON válido');
      }
    } else {
      console.warn('[BODY] Respuesta vacía');
    }

    const entries = performance.getEntriesByName(url, 'resource') as PerformanceResourceTiming[];
    const timing = entries[entries.length - 1];

    if (timing) {
      console.log('========== NETWORK ==========');
      console.log('[NET] Protocol:', timing.nextHopProtocol || 'No disponible');
      console.log('[NET] Duration:', timing.duration, 'ms');
      console.log('[NET] TransferSize:', timing.transferSize);
      console.log('[NET] EncodedSize:', timing.encodedBodySize);
    }

    console.log('========== RESULTADO ==========');

    if (response.ok) {
      console.log('[OCR] HTTP exitoso');
      console.log('[OCR] Resultado:', responseJson ?? responseText);
    } else {
      console.error('[OCR] HTTP error:', response.status);

      if (responseJson !== null) {
        console.log('[OCR] JSON recibido pese al error:', responseJson);
      } else if (responseText) {
        console.log('[OCR] Texto recibido pese al error:', responseText);
      }
    }

  } catch (error) {
    console.error('========== EXCEPCIÓN ==========');
    console.error('[OCR] Error:', error);

    if (error instanceof Error) {
      console.error('[OCR] Mensaje:', error.message);
      console.error('[OCR] Stack:', error.stack);
    }
  } finally {
    console.log('[OCR] Tiempo total:', ((performance.now() - start) / 1000).toFixed(3), 's');
    console.log('========== FIN OCR DEBUG ==========');
  }
}









}




