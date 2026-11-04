import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { ProductData } from '../interfaces/opportunity';
import { environment } from '../../environments/environment';
import { Patient } from '../interfaces/patient';
import { SaleOrderDraft } from '../interfaces/sale-order';

@Injectable({
  providedIn: 'root'
})
export class PosOrderService {

  private API_URL = environment.apiHost;

  constructor(private http: HttpClient) { }

  public getLast24HoursPosOrders(number: number, string: string): Observable<any> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Resta 24 horas
    const formattedYesterday = yesterday.toISOString().split('T')[0] + " " + yesterday.toTimeString().split(' ')[0];
    
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,    // Nombre de la base de datos
          number,            // ID de usuario o número de sesión
          string,            // Contraseña o token de autenticación
          "pos.order",  // Modelo a consultar
          "search_read",     // Método para buscar y leer registros
          [
            [["create_date", ">", formattedYesterday], ["state", "=", "draft"]] // Filtro por últimos 24 horas y estado draft
          ],
          {
            "fields": [] // Campos a leer (ajusta según necesidad)
          }
        ]
      },
      id: 1
    };
  
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public getLast24HoursPosOrderLines(number: number, string: string): Observable<any> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Resta 24 horas
    const formattedYesterday = yesterday.toISOString().split('T')[0] + " " + yesterday.toTimeString().split(' ')[0];
    
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,    // Nombre de la base de datos
          number,            // ID de usuario o número de sesión
          string,            // Contraseña o token de autenticación
          "pos.order.line",  // Modelo a consultar
          "search_read",     // Método para buscar y leer registros
          [
            [["create_date", ">", formattedYesterday]] // Filtro por últimos 24 horas
          ],
          {
            "fields": ["id", "order_id", "product_id", "price_unit", "qty", "int_field_1", "note", "create_date"],
            "context": { "lang": "es_CO" }
          }
        ]
      },
      id: 1
    };
  
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  //uno solo
  public postPosOrderLineDelivered(number:number,string:string,posOrderLineId: number,qty:any): Observable<any> {
    const now = new Date();
    const rightNow = new Date(now.getTime());
    const body = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
            environment.db,
            2,
            "LAfacil123-.-",
            "pos.order.line.delivered",
            "create",
            [
                {
                    "order_line_id": posOrderLineId,
                    "qty_delivered": qty,
                    "delivery_date": rightNow
                }
            ]
        ]
      },     
      "id": 1
    }
    console.log("body delivered",body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }


  public updatePosOrderLineDelivered(
    number: number,
    string: string,
    order_id: number,
    product_id: number,
    qty: any
  ): Observable<any> {
    const headers = new HttpHeaders({ "Content-Type": "application/json" });
  
    // 1️⃣ Buscar los IDs de los registros con "search"
    const searchBody = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,
          2,
          "LAfacil123-.-",
          "pos.order.line.delivered",
          "search",
          [
            [
              ["order_id", "=", order_id],
              ["product_id", "=", product_id]
            ]
          ]
        ]
      },
      id: 1
    };
  
    return this.http.post(this.API_URL, searchBody, { headers }).pipe(
      switchMap((searchResponse: any) => {
        const ids = searchResponse.result;
        console.log("📌 IDs encontrados:", ids);
  
        if (!ids || ids.length === 0) {
          console.log("⚠️ No se encontraron registros, creando uno nuevo...");
  
          // 2️⃣ Si no existen registros, crearlo con "create"
          const createBody = {
            jsonrpc: "2.0",
            method: "call",
            params: {
              service: "object",
              method: "execute_kw",
              args: [
                environment.db,
                2,
                "LAfacil123-.-",
                "pos.order.line.delivered",
                "create",
                [
                  {
                    order_id: order_id,
                    product_id: product_id,
                    int_field_1: qty,
                    qty: qty
                  }
                ]
              ]
            },
            id: 2
          };
  
          return this.http.post(this.API_URL, createBody, { headers });
        }
  
        // 3️⃣ Si existen registros, actualizarlos con "write"
        const updateBody = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            service: "object",
            method: "execute_kw",
            args: [
              environment.db,
              2,
              "LAfacil123-.-",
              "pos.order.line.delivered",
              "write",
              [ids, { int_field_1: qty }]
            ]
          },
          id: 3
        };
  
        return this.http.post(this.API_URL, updateBody, { headers });
      })
    );
  }


  public getPosOrderLineDeliveredList(number:number,string:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
          "service": "object",
          "method": "execute_kw",
          "args": [
              environment.db,
              number,
              string,
              "pos.order.line.delivered",
              "search_read",
              [],
              {
                  "fields": ["id", "order_id", "product_id", "qty", "int_field_1", "delivery_date"],
                  "context": { "lang": "es_CO" }
              }
          ]
      },
      "id": 1
    }
    console.log("body delivered",body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

}















  // public updatePosOrderLineDelivered(
  //   number:number,string:string,
  //   order_id: number,
  //   product_id: number,
  //   qty: any
  // ): Observable<any> {
  //   const headers = new HttpHeaders({ "Content-Type": "application/json" });
  
  //   // 1️⃣ Buscar los IDs de los registros con "search"
  //   const searchBody = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         2,
  //         "LAfacil123-.-",
  //         "pos.order.line.delivered",
  //         "search",
  //         [
  //           [
  //             ["order_id", "=", order_id],
  //             ["product_id", "=", product_id]
  //           ]
  //         ]
  //       ]
  //     },
  //     id: 1
  //   };
  
  //   //console.log("🔎 Buscando IDs con:", searchBody);
  
  //   return this.http.post(this.API_URL, searchBody, { headers }).pipe(
  //     switchMap((searchResponse: any) => {
  //       const ids = searchResponse.result;
  //       console.log("📌 IDs encontrados:", ids);
  
  //       if (!ids || ids.length === 0) {
  //         return throwError(() => new Error("❌ No se encontraron registros para actualizar."));
  //         CHAT GPT HERE!
  //       }
  
  //       // 2️⃣ Actualizar los registros encontrados con "write"
  //       const updateBody = {
  //         jsonrpc: "2.0",
  //         method: "call",
  //         params: {
  //           service: "object",
  //           method: "execute_kw",
  //           args: [
  //             environment.db,
  //             2,
  //             "LAfacil123-.-",
  //             "pos.order.line.delivered",
  //             "write",
  //             [ids, { "int_field_1": qty }]
  //           ]
  //         },
  //         id: 2
  //       };
  
  //       //console.log("✏️ Actualizando con:", updateBody);
  //       return this.http.post(this.API_URL, updateBody, { headers });
  //     })
  //   );
  // }





  // public updatePosOrderLineDelivered(
  //   number: number,
  //   string: string,
  //   order_id: number,
  //   product_id: number,
  //   qty: any
  // ): Observable<any> {
  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //       "service": "object",
  //       "method": "execute_kw",
  //       "args": [
  //         environment.db,
  //         2,
  //         "LAfacil123-.-",
  //         "pos.order.line.delivered",
  //         "write",
  //         [
  //           [["order_line_id.order_id", "=", order_id], ["order_line_id.product_id", "=", product_id]], // Filtro
  //           { "int_field_1": qty }
  //         ]
  //       ]
  //     },
  //     "id": 1
  //   };
  
  //   console.log("body update", body);
  //   console.log("body update", body);
  //   const headers = new HttpHeaders({ "Content-Type": "application/json" });
  
  //   return this.http.post(this.API_URL, body, { headers });
  // }

  

  // public updatePosOrderLineDelivered(
  //   number: number,
  //   string: string,
  //   order_id: number,
  //   product_id: number,
  //   qty: any
  // ): Observable<any> {
  //   const now = new Date();
  //   const formattedDate = now.toISOString().slice(0, 19).replace("T", " "); // Convierte a formato válido para Odoo
  
  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //       "service": "object",
  //       "method": "execute_kw",
  //       "args": [
  //         environment.db,
  //         2,
  //         "LAfacil123-.-",
  //         "pos.order.line.delivered",
  //         "modify_by_order_line_id",
  //         [
  //           posOrderLineId,
  //           {
  //             "qty_delivered": qty,
  //             "delivery_date": formattedDate
  //           }
  //         ]
  //       ]
  //     },
  //     "id": 1
  //   };
  
  //   console.log("body update", body);
  //   const headers = new HttpHeaders({ "Content-Type": "application/json" });
  
  //   return this.http.post(this.API_URL, body, { headers });
  // }
  

  // public updatePosOrderLineDelivered(number:number,string:string,posOrderLineId: number,qty:any): Observable<any> {
  //   const now = new Date();
  //   const rightNow = new Date(now.getTime());
  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //         "service": "object",
  //         "method": "execute_kw",
  //         "args": [
  //             environment.db,
  //             2,
  //             "LAfacil123-.-",
  //             "pos.order.line.delivered",
  //             "modify_by_order_line_id",
  //             [
  //               posOrderLineId,
  //                 {
  //                     "qty_delivered": qty,
  //                     "delivery_date": rightNow
  //                 }
  //             ]
  //         ]
  //     },
  //     "id": 1
  //   }
  //   console.log("body update",body)
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(this.API_URL, body, { headers });
  // }