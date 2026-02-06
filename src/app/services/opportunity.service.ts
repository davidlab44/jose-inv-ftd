import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ProductData } from '../interfaces/opportunity';
import { environment } from '../../environments/environment';

import { mapToSession, Session } from '../interfaces/session';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  private API_URL = environment.apiHost;

  constructor(private http: HttpClient) { }




  public createPosOrder(
    id: number,
    password: string,
    order: any[],
    subtotal: number,
    taxes: number,
    total: number,
    currentPosSessionId: number,
    uid: string,
    mesa_id: any
  ): Observable<any> {
    const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");


    const body = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        service: "object",
        method: "execute_kw",
        args: [
          environment.db,
          id,
          password,
          "pos.order",
          "create",
          [
            {
              name: `Order ${uid}`,
              pos_reference: `Order ${uid}`,   // 👈 agregado aquí
              session_id: currentPosSessionId,
              user_id: 2,
              partner_id: false,
              pricelist_id: 1,
              amount_total: total,
              amount_tax: taxes,
              amount_paid: 0,
              amount_return: 0,
              state: "draft",
              table_id: mesa_id,
              date_order: dateStr,
              lines: order.map((item: any) => [
                0,
                0,
                {
                  product_id: item.id,
                  qty: item.cant,
                  price_unit: item.price,
                  discount: 0,
                  tax_ids: [],
                  price_subtotal: item.price * item.cant,
                  price_subtotal_incl: item.price * item.cant,
                },
              ]),
            },
          ],
        ],
      },
      id: 1,
    };

    console.log("peticion", body);
    return this.http.post<any>(this.API_URL, body);
  }




  // public createPosOrder(
  //   id: number,
  //   password: string,
  //   order: any[],
  //   subtotal: number,
  //   taxes: number,
  //   total: number,
  //   currentPosSessionId: number,
  //   uid: string,
  //   mesa_id: number
  // ): Observable<any> {
  //   const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  //   const body = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         id,
  //         password,
  //         "pos.order",
  //         "create",
  //         [
  //           {
  //             name: `Order ${uid}`,
  //             pos_reference: `Order ${uid}`,   // 👈 agregado aquí
  //             session_id: currentPosSessionId,
  //             user_id: 2,
  //             partner_id: false,
  //             pricelist_id: 1,
  //             amount_total: total,
  //             amount_tax: taxes,
  //             amount_paid: 0,
  //             amount_return: 0,
  //             state: "draft",
  //             table_id: mesa_id,
  //             date_order: dateStr,
  //             lines: order.map((item: any) => [
  //               0,
  //               0,
  //               {
  //                 product_id: item.id,
  //                 qty: item.cant,
  //                 price_unit: item.price,
  //                 discount: 0,
  //                 tax_ids: [],
  //                 price_subtotal: item.price * item.cant,
  //                 price_subtotal_incl: item.price * item.cant,
  //               },
  //             ]),
  //           },
  //         ],
  //       ],
  //     },
  //     id: 1,
  //   };

  //   console.log("peticion", body);
  //   return this.http.post<any>(this.API_URL, body);
  // }






//   public createPosOrder(
//   id: number,
//   password: string,
//   order: any[],
//   subtotal: number,
//   taxes: number,
//   total: number,
//   currentPosSessionId: number,
//   uid: string,
//   mesa_id: any
// ): Observable<any> {
//   const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

//   const body = {
//     jsonrpc: "2.0",
//     method: "call",
//     params: {
//       service: "object",
//       method: "execute_kw",
//       args: [
//         environment.db,
//         id,
//         password,
//         "pos.order",
//         "create",
//         [
//           {
//             name: `Order ${uid}`,
//             session_id: currentPosSessionId,
//             user_id: 2,
//             partner_id: false,
//             pricelist_id: 1,
//             amount_total: total,
//             amount_tax: taxes,
//             amount_paid: 0,       // 👈 obligatorio
//             amount_return: 0,     // 👈 obligatorio
//             state: "draft",
//             table_id: mesa_id,
//             date_order: dateStr,
//             lines: order.map((item: any) => [
//               0,
//               0,
//               {
//                 product_id: item.id,
//                 qty: item.cant,
//                 price_unit: item.price,
//                 discount: 0,
//                 tax_ids: [],
//                 price_subtotal: item.price * item.cant,           // 👈 agregado
//                 price_subtotal_incl: item.price * item.cant,     // 👈 agregado (si tienes impuestos aplica aquí)
//               },
//             ]),
//           },
//         ],
//       ],
//     },
//     id: 1,
//   };

//   console.log("peticion", body);
//   return this.http.post<any>(this.API_URL, body);
// }





// public createPosOrder(
//   id: number,
//   password: string,
//   order: any[],
//   subtotal: number,
//   taxes: number,
//   total: number,
//   currentPosSessionId: number,
//   uid: string,
//   mesa_id: any
// ): Observable<any> {
//   const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

//   const body = {
//     jsonrpc: "2.0",
//     method: "call",
//     params: {
//       service: "object",
//       method: "execute_kw",
//       args: [
//         environment.db,
//         id,
//         password,
//         "pos.order",
//         "create",
//         [
//           {
//             name: `Order ${uid}`,
//             session_id: currentPosSessionId,
//             user_id: 2,
//             partner_id: false,
//             pricelist_id: 1,
//             amount_total: total,
//             amount_tax: taxes,
//             amount_paid: 0,       // 👈 obligatorio
//             amount_return: 0,     // 👈 obligatorio
//             state: "draft",
//             table_id: mesa_id,
//             date_order: dateStr,  // 👈 opcional pero recomendado
//             lines: order.map((item: any) => [
//               0,
//               0,
//               {
//                 product_id: item.id,
//                 qty: item.cant,
//                 price_unit: item.price,
//                 discount: 0,
//                 tax_ids: [],
//               },
//             ]),
//           },
//         ],
//       ],
//     },
//     id: 1,
//   };

//   console.log("peticion", body);
//   return this.http.post<any>(this.API_URL, body);
// }


  // public createPosOrder(
  //   id: number,
  //   password: string,
  //   order: any[],
  //   subtotal: number,
  //   taxes: number,
  //   total: number,
  //   currentPosSessionId: number,
  //   uid:string,mesa_id
  // ): Observable<any> {
  //   //const uid = Date.now().toString();
  //   const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  //   const body = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         id,
  //         password,
  //         "pos.order",
  //         "create",
  //         [
  //           {
  //             name: `Order ${uid}`,
  //             session_id: currentPosSessionId,
  //             user_id: 2,
  //             partner_id: false,
  //             pricelist_id: 1,
  //             amount_total: total,
  //             amount_tax: taxes,
  //             state: "draft",
  //             table_id: mesa_id,
  //             lines: order.map((item: any) => [
  //               0,
  //               0,
  //               {
  //                 product_id: item.id,
  //                 qty: item.cant,
  //                 price_unit: item.price,
  //                 discount: 0,
  //                 tax_ids: [],
  //               },
  //             ]),
  //           },
  //         ],
  //       ],
  //     },
  //     id: 1,
  //   };

  //   console.log("peticion", body);
  //   return this.http.post<any>(this.API_URL, body);
  // }








  // public createPosOrder(
  //   id: number,
  //   password: string,
  //   order: any[],
  //   subtotal: number,
  //   taxes: number,
  //   total: number,
  //   currentPosSessionId: number,
  //   uid:string,mesa_id
  // ): Observable<any> {
  //   //const uid = Date.now().toString();
  //   const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  //   const body = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         id,
  //         password,
  //         "pos.order",
  //         "create_from_ui",
  //         [
  //           [
  //             {
  //               id: uid,
  //               to_invoice: false,
  //               data: {
  //                 uid: uid,
  //                 name: `Order ${uid}`,
  //                 sequence_number: 1,
  //                 date_order: dateStr,
  //                 pos_session_id: currentPosSessionId,
  //                 user_id: 2,
  //                 partner_id: false,
  //                 pricelist_id: 1,
  //                 fiscal_position_id: false,
  //                 amount_total: total,
  //                 amount_tax: taxes,
  //                 amount_paid: total,
  //                 amount_return: 0,
  //                 state: "draft",
  //                 table_id:mesa_id,
  //                 lines: order.map((item: any) => [
  //                   0,
  //                   0,
  //                   {
  //                     product_id: item.id,
  //                     qty: item.cant,
  //                     price_unit: item.price,
  //                     discount: 0,
  //                     tax_ids: [],
  //                     price_subtotal: item.price * item.cant,
  //                     price_subtotal_incl: (item.price * item.cant) * 1.10,
  //                   },
  //                 ]),
  //                 statement_ids: [
  //                   [
  //                     0,
  //                     0,
  //                     {
  //                       payment_method_id: 39, //  ID del método de pago en tu POS hardcodeado
  //                       amount: total,
  //                       name: dateStr,
  //                     },
  //                   ],
  //                 ],
  //               },
  //             },
  //           ],
  //         ],
  //       ],
  //     },
  //     id: 1,
  //   };

  //   console.log("peticion", body);
  //   return this.http.post<any>(this.API_URL, body);
  // }





  // public createPosOrder(
  //   id: number,
  //   password: string,
  //   order: any[],
  //   subtotal: number,
  //   taxes: number,
  //   total: number
  // ): Observable<any> {
  //   const uid = Date.now().toString();
  //   const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  //   const body = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         id,
  //         password,
  //         "pos.order",
  //         "create_from_ui",
  //         [
  //           [
  //             {
  //               id: uid,
  //               to_invoice: false,
  //               data: {
  //                 uid: uid,
  //                 name: `Order ${uid}`,
  //                 sequence_number: 1,
  //                 date_order: dateStr,
  //                 pos_session_id: 46, // 👈 ajusta según tu sesión activa
  //                 user_id: 2,
  //                 partner_id: false,
  //                 pricelist_id: 1,
  //                 fiscal_position_id: false,
  //                 amount_total: total,
  //                 amount_tax: taxes,
  //                 amount_paid: total,
  //                 amount_return: 0,
  //                 lines: order.map((item: any) => [
  //                   0,
  //                   0,
  //                   {
  //                     product_id: item.id,
  //                     qty: item.cant,
  //                     price_unit: item.price,
  //                     discount: 0,
  //                     tax_ids: [],
  //                     price_subtotal: item.price * item.cant,
  //                     price_subtotal_incl: (item.price * item.cant) * 1.10 // con impuesto
  //                   }
  //                 ]),
  //                 statement_ids: [
  //                   [
  //                     0,
  //                     0,
  //                     {
  //                       payment_method_id: 39, // 👈 ID de tu método de pago
  //                       amount: total,
  //                       name: dateStr,
  //                     },
  //                   ],
  //                 ],
  //               },
  //             },
  //           ],
  //         ],
  //       ],
  //     },
  //     id: 1,
  //   };

  //   console.log("peticion", body);
  //   return this.http.post<any>(this.API_URL, body);
  // }



  // public createPosOrder(id: number, password: string): Observable<any> {
  //   const body = {
  //     jsonrpc: "2.0",
  //     method: "call",
  //     params: {
  //       service: "object",
  //       method: "execute_kw",
  //       args: [
  //         environment.db,
  //         id,
  //         password,
  //         "pos.order",
  //         "create_from_ui",
  //         [[
  //           {
  //             id: "1234567890",
  //             to_invoice: false,
  //             data: {
  //               uid: "1234567890",
  //               name: "Order 1234567890",
  //               sequence_number: 1,
  //               date_order: "2025-09-25 18:22:20",
  //               pos_session_id: 46,
  //               user_id: 6,
  //               partner_id: false,
  //               pricelist_id: 1,
  //               fiscal_position_id: false,
  //               amount_total: 6000,
  //               amount_tax: 0,
  //               amount_paid: 6000,
  //               amount_return: 0,
  //               lines: [
  //                 [0, 0, {
  //                   product_id: 650,
  //                   qty: 2,
  //                   price_unit: 3000,
  //                   discount: 0,
  //                   tax_ids: [],
  //                   price_subtotal: 6000,
  //                   price_subtotal_incl: 6000
  //                 }]
  //               ],
  //               statement_ids: [
  //                 [0, 0, {
  //                   payment_method_id: 39,
  //                   amount: 6000,
  //                   name: "2025-09-25 18:22:20"
  //                 }]
  //               ]
  //             }
  //           }
  //         ]]
  //       ]
  //     },
  //     id: 1
  //   };
  //   console.log("peticion", body);
  //   return this.http.post<any>(this.API_URL, body);
  // }





  public getProducts(id:number,password:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "product.product",
          "search_read",
          [
            [
              ["type", "=", "product"]
            ],
            ["name", "description", "default_code", "list_price", "qty_available", "image_1920", "categ_id", "create_uid"]
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public getProductsByCat(id:number, password:string, categId:number): Observable<any> {
    console.log('getProductByCategory checking categ', categId);
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "product.product",
          "search_read",
          [
            [
              ["pos_categ_ids", "=", categId],
              ["active", "=", true],
              ["available_in_pos", "=", true],
              ["type", "=", "product"],
              ["qty_available", ">", 0],
            ],
            ["id","display_name","name","qty_available","list_price","create_uid","create_date"]
          ],
          {
            "context": { "lang": "es_CO" }
          }
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }





  // public getActiveSession(userId: number, password: string): Observable<any> {
  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //       "service": "object",
  //       "method": "execute_kw",
  //       "args": [
  //         environment.db,
  //         userId,
  //         password,
  //         "pos.session",
  //         "search_read",
  //         [
  //           [
  //             ["state", "=", "opened"]  // sesiones abiertas
  //           ],
  //           ["id", "name", "user_id", "config_id", "state"]
  //         ],
  //         { "limit": 1 }
  //       ]
  //     }
  //   };

  //   return this.http.post<any>(this.API_URL, body);
  // }



  // public getProductsByCat(id:number, password:string, categId:number): Observable<any> {
  //   console.log('getProductByCategory checking categ', categId);

  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //       "service": "object",
  //       "method": "execute_kw",
  //       "args": [
  //         environment.db,
  //         id,
  //         password,
  //         "product.product",
  //         "search_read",
  //         [
  //           [
  //             ["pos_categ_ids", "=", categId],
  //             ["active", "=", true]
  //           ],
  //           ["id","name","qty_available","list_price","create_uid","create_date"]
  //         ],
  //         {}
  //       ]
  //     }
  //   };

  //   return this.http.post<any>(this.API_URL, body).pipe(
  //     // transformamos name
  //     map(response => {
  //       if (response?.result) {
  //         response.result = response.result.map((prod: any) => {
  //           try {
  //             const parsed = JSON.parse(prod.name);
  //             prod.name = parsed["es_CO"] ?? prod.name;
  //           } catch (e) {
  //             // si no es JSON válido, lo dejamos igual
  //           }
  //           return prod;
  //         });
  //       }
  //       return response;
  //     })
  //   );
  // }



  // public getProductsByCat(id:number,password:string,categId:number): Observable<any> {
  //   console.log('getProductByCategory checking categ',categId)

  //   const body = {
  //     "jsonrpc": "2.0",
  //     "method": "call",
  //     "params": {
  //       "service": "object",
  //       "method": "execute_kw",
  //       "args": [
  //         environment.db,
  //         id,
  //         password,
  //         "product.product",
  //         "search_read",
  //         [
  //           [
  //             ["pos_categ_ids", "=", categId],
  //             ["active", "=", true]
  //           ],
  //           ["id","name","qty_available","list_price","create_uid","create_date"]
  //         ],
  //         {}
  //       ]
  //     }
  //   };
  //   //console.log("peticion",body)
  //   return this.http.post<any>(this.API_URL, body);
  // }


   public getPosCategories(id:number,password:string,): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "pos.category",
          "search_read",
          [
            [],
            ["id", "name", "parent_id"]
          ]
        ]
      }
    };
    console.log('url',environment.apiHost);
    console.log('peticion body',body);
    return this.http.post<any>(this.API_URL, body);
  }


  //traer todos los productos excepto los Util
  //adentro hay un ejemplo de como hacer locontrario, es ecir , traer todas las Util
  public getProductTypeConsumable(id:number,password:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "product.product",
          "search_read",
          [
            [
              ["type", "=", "consu"],
              ["categ_id.name", "!=", "Util"]
            ],
            ["id","product_tmpl_id","name", "description", "default_code", "list_price", "qty_available", "image_1920", "categ_id", "create_uid"]
          ],
          // [
          //   [
          //     //["type", "=", "product"]
          //     //["categ_id", "=", 7]  // Filtro para la categoría
          //   ]
          // ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }

  public getProductLoteANdExpiratioDate(id:number,password:string,product_id): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "product.product",
          "search_read",
          [
            [
              ["id", "=", product_id]  // Assuming product_id is the ID of the product you want to retrieve
            ]
          ],
          [
            "name",
            "description",
            "default_code",
            "list_price",
            "qty_available",
            "image_1920",
            "categ_id",
            "create_uid",
            "lote",                // Include 'lote' field
            "expiration_date"      // Include 'expiration date' field
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }








  public getProductCategoryOfaParticularProduct(id:number,password:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "product.product",
          "search_read",
          [
            [
              ["categ_id.name", "!=", "Util"]
            ],
            ["name", "description", "default_code", "list_price", "qty_available", "image_1920", "categ_id", "create_uid"]
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public obtenerTodosLosProductosQuePertenecenAUnaCategoria(id:number,password:string): Observable<any> {
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
          "product.product",
          "search_read",
          [
            [
              ["categ_id", "!=", 1]
            ],
            ["name", "description", "default_code", "list_price", "qty_available", "image_1920", "categ_id", "create_uid"]
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public getWomCategoryOfAProduct(id:number,password:string): Observable<any> {
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
          "product.product",
          "search_read",
          [
            [
              ["name", "=", "Vehiculo"]
            ],
            ["uom_id"]
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public getVehicles(id:number,password:string): Observable<any> {
    const body = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "service": "object",
        "method": "execute_kw",
        "args": [
          environment.db,
          id,
          password,
          "product.product",
          "search_read",
          [
            [
              ["categ_id.name", "!=", "Util"]
            ],
            ["name", "description", "default_code", "list_price", "qty_available", "image_1920", "categ_id", "create_uid"]
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }


  public getAllWomCategoriesGeneric(id:number,password:string): Observable<any> {
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
          "uom.category",
          "search_read",
          [
            [],
            ["id", "name"]
          ],
          {}
        ]
      }
    };
    return this.http.post<any>(this.API_URL, body);
  }



  public getWomRelatedToACategory(id:number,password:string,wom:number): Observable<any> {
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
          "uom.uom",
          "search_read",
          [
            [
              ["category_id", "=", wom]
            ],
            ["id", "name"]
          ],
          {}
        ]
      }
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
    return this.http.post('/jsonrpc', body, { headers });
  }


}
