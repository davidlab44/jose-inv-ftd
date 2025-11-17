import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductData } from '../interfaces/opportunity';
import { environment } from '../../environments/environment';
import { Patient } from '../interfaces/patient';
import { SaleOrderDraft } from '../interfaces/sale-order';

@Injectable({
  providedIn: 'root'
})
export class SaleOrderService {

  private API_URL = environment.apiHost;
  private db = environment.apiHost;

  constructor(private http: HttpClient) { }

  public getProducts(number:number,string:string): Observable<any> {
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
              "product.product",
              "search_read",
              [[], ["name", "description","default_code", "list_price", "qty_available", "image_1920", "categ_id", "create_uid"]],
              {}
          ]
      },
      "id": 1
    };
    return this.http.post<any>(this.API_URL, body);
  }



  public createProduct(productData: ProductData): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,   // Replace with your database name
          2,
          "LAfacil123-.-", // Password (replace with your password)
          "product.product", // Odoo model
          "create",          // Odoo method to create a new record
          [
            {
              "name": "Name4",     // Hardcoded product name
              "list_price": 2,            // Hardcoded price
              "type": "service",                // Product type (e.g., 'consu' for consumable, 'service' for services)
              "categ_id": 1,                  // Example category ID
              "description": "description", // Example description (optional)
              "image_1920" : productData.resizedImage 
            }
          ]
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public createQuotation(number:number,string:string,draftLocal:SaleOrderDraft,orderLine: any, granId:number): Observable<any> {
    //Importante: cuando creo la oportunidad le pongo que el salesperson (o sea field 'use_id') es 2 (que es lmi usuario administrador , 
    //esto tiene un proposito , cuando voy a mostrar en la interfaz de usuario las elegidas yo valido si es diferente de 1 , voalaaa es porque esa es la elegida 
    // quiere decir que ese cam,po 'user_id'  se modifico
    //recuerda que ese campo solo se modifica cuando el salesaman (aspiradora) es elegida
    // const body = {
    //   "jsonrpc": "2.0",
    //   "method": "call",
    //   "params": {
    //     "service": "object",
    //     "method": "execute_kw",
    //     "args": [
    //       environment.db,  // Reemplaza con tu base de datos
    //       2,
    //       "LAfacil123-.-", // Reemplaza con tu contraseña
    //       "sale.order", // Modelo de Odoo para cotizaciones
    //       "create",    // Método de creación de cotización
    //       [
    //         {
    //           "partner_id": number,  // ID del cliente.
    //           "user_id": 2,  //user_id es el id del salesperson => hardcodeado el administrador
    //           "patient_name":patient.name, 
    //           "patient_type_document":patient.type, 
    //           "patient_dni":patient.name, 
    //           "patient_area":patient.bed,
    //           "order_line": orderLine
    //         }
    //       ],
    //       {
    //         "context": {
    //           "mail_create_nosubscribe": true  // Prevent automatic email notification
    //         }
    //       }
    //     ], 
    //   },
    //   "id": 1
    // };
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
            "sale.order",
            "create",
            [
              {
                "partner_id": 2,
                "user_id": 2,
                "int_field_1": granId,
                "patient_name": "NA",
                "patient_type_document": "",
                "patient_dni": "NA",
                "patient_area": "NA",
                "order_line": []
              }
            ]
          ],
          "kwargs": {
            "context": {
              "mail_create_nosubscribe": true,
              "mail_notify_force_send": false,
              "mail_auto_subscribe_no_notify": true
            }
          }
        },
        "id": 1
    };
    console.log('oportunidad que se creara mbm: ',body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }



























  public updateDraftUserId(number:number,string:string,draftId:number,userId:number): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,   // Replace with your database name
          number,     // Replace with your user ID
          string,     // Replace with your password
          "sale.order", // Odoo model for quotations
          "write",    // Method to update the quotation
          [
            [draftId],      // ID of the quotation to update (replace with the actual ID)
            {
              "user_id": userId  // Update the salesperson to user ID 9
            }
          ]
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public addSalesPersontoAnExistingQuotation(number:number,string:string,idQuotation:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,       // Replace with your database name
          number,              // Replace with the user ID
          string, // Replace with your password
          "sale.order",   // Odoo model for quotations
          "write",        // Method to update the record
          [
            [idQuotation],         // ID of the quotation to update (replace with actual quotation ID)
            {
              "user_id": number  // ID of the salesperson (replace with actual salesperson ID)
            }
          ]
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public saveDraftHeadersInRemoteServer(number:number,string:string,draft:any): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,       // Replace with your database name
          number,              // Replace with the user ID
          string, // Replace with your password
          "sale.order",   // Odoo model for quotations
          "write",        // Method to update the record
          [
            [draft.id],         // ID of the quotation to update (replace with actual quotation ID)
            {
              "patient_name": draft.patient_name,
              "patient_type_document": 1,
              "patient_dni": draft.patient_dni,
              "patient_area": draft.patient_area,  // ID of the salesperson (replace with actual salesperson ID)
            }
          ]
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public getDrafts(number:number,string:string): Observable<any> {
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
          "sale.order",
          "search_read",
          [[["state", "=", "draft"]]],
          {"fields": ["id", "name", "partner_id", "user_id", "note", "amount_total", "order_line" ]}
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }


  public getDraftsBelongToThisGran(number:number,string:string,granId:number): Observable<any> {
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
          "sale.order",
          "search_read",
          [[["state", "=", "draft"],["int_field_1", "=", granId]]],
          {"fields": ["id", "name", "partner_id", "user_id", "note", "amount_total", "order_line",
          "patient_name", "patient_type_document", "patient_dni", "patient_area" ]}
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }


  public getDraftByID(number:number,string:string,draftId:number): Observable<any> {
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
          "sale.order",
          "search_read",
          [[["id", "=", draftId]]],
          {"fields": ["id", "name", "partner_id", "user_id", "note", "amount_total", "order_line",
          "patient_name", "patient_type_document", "patient_dni", "patient_area" 
          ]}
        ]
      },
      "id": 1
    };
    console.log("getDraftByID que se consultara: ",body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }


  public getOrderLineDetails(number:number,string:string,orderLineIds: number[]): Observable<any> {
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,
          number,
          string,
          "sale.order.line",
          "read",
          orderLineIds,
          {"fields": ["id", "product_id", "product_uom_qty"]}
        ]
      },
      id: 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public getSales(number:number,string:string): Observable<any> {
    const body =   {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          number,
          string,
          "sale.order",
          "search_read",
          [[["state", "=", "sale"]]],  // Filter for confirmed quotations (state = sale)
          {
            "fields": [
              "id", "name", "partner_id", "note", "amount_total", "order_line",
              "violet_score_salesperson", "violet_review_salesperson", "violet_review_client", 
              "violet_image_1920", "violet_is_delivery", "violet_is_insitu", "violet_quotation_note"
            ]
          }
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public deleteDraftById(number:number,string:string,quotation_id:number): Observable<any> {
    const body =   {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          number,
          string,
          "sale.order",
          "unlink",
          [
            [quotation_id]
          ]
        ]
      },
      "id": 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }












  //##############################
  //sale order line
  //##############################
  public addSaleOrderLine(number: number, string: string,saleOrderLine:any): Observable<any> {
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,
          number,
          string,
          "sale.order.line",
          "create",
          [
            {
              "order_id": saleOrderLine.order_id,              // Replace with the actual Sale Order ID
              "product_id": saleOrderLine.product_id,            // Replace with the actual Product ID
              "product_uom_qty": saleOrderLine.product_uom_qty,       // Quantity of the product
              "price_unit": 100.00,       // Price per unit
              "discount": 10              // Discount (percentage)
            }
          ]
        ]
      },
      id: 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public getAllSaleOrderLines(number:number,string:string,): Observable<any> {
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,
           number,
           string,
          "sale.order.line",
          "search_read",
          [[]], // Empty domain to fetch all records
          {"fields": ["id", "order_id", "product_id", "product_uom_qty", "price_unit", "discount"]} // Specify fields you want to retrieve
        ]
      },
      id: 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  // public getSaleOrderLines(number:number,string:string): Observable<any> {
  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //       "service": "object",
  //       "method": "execute_kw",
  //       "args": [
  //         environment.db,
  //         number,
  //         string,
  //         "sale.order.line",
  //         "search_read",
  //         [[[]]],
  //         {"fields": ["id"]}
  //       ]
  //     },
  //     "id": 1
  //   };
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(this.API_URL, body, { headers });
  // }
  

  public deleteSaleOrderLineById(number: number, string: string, idLine: number): Observable<any> {
    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,
          number,
          string,
          "sale.order.line",
          "unlink",
          [[idLine]] // List containing the ID of the record to be deleted
        ]
      },
      id: 1
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }
  



  // public getIdsToDelete(number:number,string:string,order_id:number,product_id:number,): Observable<any> {
  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //         "service": "object",
  //         "method": "execute_kw",
  //         "args": [
  //           environment.db,
  //             number,
  //             string,      // Contraseña del usuario
  //             "sale.order.line",     // Modelo sale.order.line
  //             "search",              // Método para buscar registros
  //             [
  //                 [
  //                     ["order_id", "=", order_id],
  //                     ["product_id", "=", product_id]
  //                 ]
  //             ]
  //         ],
  //         "kwargs": {
  //             "context": {}
  //         }
  //     },
  //     "id": 5
  //   };
  //   console.log('consulta que se realizara: ',body)
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(this.API_URL, body, { headers });
  // }



  // public deleteSaleOrderLineByDraftAndProduct(number: number, string: string, draftId: number,productId:number): Observable<any> {
  //   const body = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         number,
  //         string,
  //         "sale.order.line",
  //         "unlink",
  //         [[idLine]] // List containing the ID of the record to be deleted
  //       ]
  //     },
  //     id: 1
  //   };
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(this.API_URL, body, { headers });
  // }




  //###############################
  // Model A
  //###############################
  public postularmeAEstaOportunidad(number:number,string:string,idQuotation:number,myResPartner:number): Observable<any> {
    console.log(number)
    console.log(string)
    console.log(idQuotation)
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,        // Nombre de la base de datos
          number,               // ID del usuario
          string, // Contraseña
          "a",            // Modelo
          "create",       // Método
          [
            {
              "q": idQuotation,
              "u": myResPartner
            }
          ]
        ]
      },
      "id": 1
    };
    //console.log(body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }


  public getAmodelOseaPostulacionesByQuotation(number:number,string:string,idQuotation:number): Observable<any> {
    // console.log(number)
    // console.log(string)
    // console.log(idQuotation)
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,        // Nombre de la base de datos
          number,               // ID del usuario
          string, // Contraseña
          "a",            // Modelo
          "get_by_q",     // Método
          [
            idQuotation          // Valor de q que deseas buscar
          ]
        ]
      },
      "id": 1
    };
    //console.log('get_by_q quotationId',body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public getAmodelOseaPostulacionesByUser(number:number,string:string,res_partner_de_este_usuario_tipo_aspiradora_no_es_un_cliente_ojo_son_dos_cosas_distintas_este_es_el_campo_u): Observable<any> {
    console.log(number)
    console.log(string)
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,        // Nombre de la base de datos
          number,               // ID del usuario
          string, // Contraseña
          "a",            // Modelo
          "get_by_u",    // Método
          [
            res_partner_de_este_usuario_tipo_aspiradora_no_es_un_cliente_ojo_son_dos_cosas_distintas_este_es_el_campo_u              // Valor de u que deseas buscar
          ]
        ]
      },
      "id": 1
    };
    //console.log('modelA body',body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public eliminarRegistrosModelAPorQuotationId(number:number,string:string,idQuotation:number): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,        // Nombre de la base de datos
          number,               // ID del usuario
          string, // Contraseña
          "a",            // Modelo
          "delete_records_by_q", // Método
          [
            idQuotation              // Valor de q que deseas eliminar
          ]
        ]
      },
      "id": 1
    };
    //console.log(body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public eliminarRegistrosModelAPorUserId(number:number,string:string,userAspiradoraPartnerId:number): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,        // Nombre de la base de datos
          number,               // ID del usuario
          string, // Contraseña
          "a",            // Modelo
          "delete_records_by_u", // Método
          [
            userAspiradoraPartnerId              // recuerde que se usa el partner_id de la aspiradora indformacion de res_partner tabla
          ]
        ]
      },
      "id": 1
    };
    //console.log(body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public deleteAllRecordsModelA(number:number,string:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,        // Nombre de la base de datos
          number,               // ID del usuario
          string, // Contraseña
          "a",            // Modelo
          "delete_all_records", // Método
          []
        ]
      },
      "id": 1
    };
    //console.log(body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

  public eliminarEstaDraft(number:number,string:string,draftId:number): Observable<any> {
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
          "sale.order",
          "unlink",
          [
            [draftId]  // Replace 'quotation_id' with the actual ID of the quotation to delete
          ]
        ]
      },
      "id": 1
    };
    //console.log(body)
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.API_URL, body, { headers });
  }

}
