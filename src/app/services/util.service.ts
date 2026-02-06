import { Injectable } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(public toastCtrl: ToastController,) { }

  extractNumber(dbFieldName: string): number {
    try { // 1️⃣ Primer intento: usando substring (formato fijo "i###")
      let extractedNumber = Number(dbFieldName.substring(1));
      if (isNaN(extractedNumber)) {// 2️⃣ Validación: si el resultado no es un número válido, probamos la segunda opción
        extractedNumber = parseInt(dbFieldName.replace(/\D+/g, ""), 10);
      }
      if (isNaN(extractedNumber)) { // 3️⃣ Si sigue siendo NaN, retornamos 0
        return 0;
      }
      return extractedNumber;
    } catch (error) {
      console.error("Error extrayendo número:", error);
      return 0; // Valor por defecto si algo falla
    }
  }

  async presentToast(msg:string,color:string='primary',duration=3000) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration, // Duración en milisegundos
      position: 'bottom', // Posición del toast
      color: color// Puedes cambiar el color (primary, secondary, danger, etc.)
    });
    await toast.present();
  }


  private loading: HTMLIonLoadingElement | null = null;
  async presentLoading(loadingController:LoadingController, msg: string) {
    this.loading = await loadingController.create({
      spinner: 'crescent',
      message: msg
    });
    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = null;
    }
  }

  //   //reviews
  // async openModal(modalController:ModalController,reviews:Revision[]) {
  //   const modal = await modalController.create({
  //     component: CommentsListModalComponent,
  //     componentProps: { //items: ['Item 1', 'Item 2', 'Item 3', 'Item 4'] 
  //       items:reviews
  //     }
  //   });
  //   return await modal.present();
  // }

  //DATE
  public formatFechaEsCo(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  public getYesterdayDate(): Date {
    const today = new Date();
    today.setDate(today.getDate() -1);
    return today;
  }

  public parseStoredDate(fechaGuardada: string): Date {    // Reemplaza espacio por 'T' si viene con hora, para que Date lo entienda mejor en formato ISO
    const fechaISO = fechaGuardada.replace(' ', 'T');
    return new Date(fechaISO);
  }

  getTodayDate(): string { // sistema de calificacion
    const date = new Date(); // Obtener el día, mes y año
    const day = String(date.getDate()).padStart(2, '0'); // Día
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes (los meses comienzan desde 0)
    const year = date.getFullYear(); // Año  // Formatear como YYYY-MM-DD
    return `${year}${month}${day}`;
  }

  getStoredDate(): number{
    const storedDate=localStorage.getItem('storedDate');
    if(Number(storedDate)){
      return Number(storedDate)
    }else{ return 0 }
  }

  formatRemainingHoursOfDay(): string[] {
    const now = new Date();
    const hoursList: string[] = [];
    for (let i = 1; i <= 15; i++) { // Solo las próximas 15 horas
      const hour = new Date(now);
      hour.setHours(now.getHours() + i);
      hour.setMinutes(0, 0, 0);
      hoursList.push(this.formatHour(hour));
    }
    return hoursList;
  }

  formatHour(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (/chrome|crios|crmo/i.test(userAgent) && !/edge|edgios|opr/i.test(userAgent)) {
      return 'Chrome';
    }
    if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
      return 'Safari';
    }
    if (/firefox|fxios/i.test(userAgent)) {
      return 'Firefox';
    }
    if (/edg/i.test(userAgent)) {
      return 'Edge';
    }
    if (/opr\//i.test(userAgent)) {
      return 'Opera';
    }
    return 'este navegador';
  }

  reloadPage(router) {
    router.navigate(['/']).then(() => {
      window.location.reload(); // fuerza recarga de toda la app
    });
  }

  //uso
  //fakeScore:any=this.generarNumeroAleatorio(4.0, 4.6);
  generarNumeroAleatorio(min: number, max: number): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  }

  convertToArray(selectedMediosTexto: string): number[] {   // Convertir el string separado por comas en un array de números
    if(selectedMediosTexto){
      let selectedMedios = selectedMediosTexto.split(',').map(num => parseInt(num, 10));
      return selectedMedios;
    }
  }

  

  resetApp(router){
    router.navigate(['/']).then(() => {
      window.location.reload(); // fuerza recarga de toda la app
    });
  }


}



// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { ProductData } from '../interfaces/opportunity';
// import { environment } from '../../environments/environment';
// import { Patient } from '../interfaces/patient';

// @Injectable({
//   providedIn: 'root'
// })
// export class GranService {

//   private API_URL = environment.apiHost;

//   constructor(private http: HttpClient) { }

//   public createGran(number:number,string:string): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,        // Nombre de la base de datos
//           number,               // ID del usuario
//           string, // Contraseña
//           "a",            // Modelo
//           "create",       // Método
//           [
//             {
//               "q": 1,
//               "u": 2
//             }
//           ]
//         ]
//       },
//       "id": 1
//     };
//     //console.log('gran que se creara es: ',body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public get_records_where_bool_false(number:number,string:string): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//           "service": "object",
//           "method": "execute_kw",
//           "args": [
//             environment.db,            
//               number,                       
//               string,                 
//               "a",                     
//               "search_read",
//               [[["bool_field_1", "=", false]]],           
//               {
//                   "fields": [
//                       "id", "q", "u", "str_field_1", "str_field_2", "str_field_3",
//                       "int_field_1", "int_field_2", "int_field_3",
//                       "bool_field_1", "bool_field_2", "bool_field_3",
//                       "image_1920", "create_date", "write_date"
//                   ]
//               }
//           ]
//       },
//       "id": 1
//     };
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public get_records_where_state_tags(number:number,string:string): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//           "service": "object",
//           "method": "execute_kw",
//           "args": [
//               environment.db,            
//               number,                       
//               string,                 
//               "a",                     
//               "search_read",
//               [[["str_field_1", "=", "tags"]]],  // Sin comillas simples alrededor de 'tags'
//               {
//                   "fields": [
//                       "id", "q", "u", "str_field_1", "str_field_2", "str_field_3",
//                       "int_field_1", "int_field_2", "int_field_3",
//                       "bool_field_1", "bool_field_2", "bool_field_3",
//                       "image_1920", "create_date", "write_date"
//                   ]
//               }
//           ]
//       },
//       "id": 1
//     };
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public get_records_where_state_production(number:number,string:string): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//           "service": "object",
//           "method": "execute_kw",
//           "args": [
//               environment.db,            
//               number,                       
//               string,                 
//               "a",                     
//               "search_read",
//               [[["str_field_1", "=", "production"]]],              {
//                   "fields": [
//                       "id", "q", "u", "str_field_1", "str_field_2", "str_field_3",
//                       "int_field_1", "int_field_2", "int_field_3",
//                       "bool_field_1", "bool_field_2", "bool_field_3",
//                       "image_1920", "create_date", "write_date"
//                   ]
//               }
//           ]
//       },
//       "id": 1
//     };
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public getAllRecords(number:number,string:string): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//           "service": "object",
//           "method": "execute_kw",
//           "args": [
//             environment.db,    // Nombre de la base de datos
//               number,                // User ID (usualmente 2 para admin)
//               string,          // Contraseña del usuario
//               "a",              // Nombre del modelo
//               "get_all_records",// Nombre del método
//               []                // Argumentos vacíos para obtener todos los registros
//           ]
//       },
//       "id": 1
//     };
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public getAmodelOseaPostulacionesByQuotation(number:number,string:string,idQuotation:number): Observable<any> {
//     // console.log(number)
//     // console.log(string)
//     // console.log(idQuotation)
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,        // Nombre de la base de datos
//           number,               // ID del usuario
//           string, // Contraseña
//           "a",            // Modelo
//           "get_by_q",     // Método
//           [
//             idQuotation          // Valor de q que deseas buscar
//           ]
//         ]
//       },
//       "id": 1
//     };
//     //console.log('get_by_q quotationId',body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public getBooleanFieldsState(number:number,string:string,idGran:number): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//           "service": "object",
//           "method": "execute_kw",
//           "args": [
//             environment.db,  // Database name
//             number,              // User ID (usually 2 for admin)
//             string,        // Password
//             "a",            // Model name
//             "get_boolean_fields_state",  // Method name
//             [idGran]             // Arguments (here, record_id = 1)
//           ]
//       },
//       "id": 1
//     };
//     //console.log('get_by_q quotationId',body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public getAmodelOseaPostulacionesByUser(number:number,string:string,res_partner_de_este_usuario_tipo_aspiradora_no_es_un_cliente_ojo_son_dos_cosas_distintas_este_es_el_campo_u): Observable<any> {
//     console.log(number)
//     console.log(string)
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,        // Nombre de la base de datos
//           number,               // ID del usuario
//           string, // Contraseña
//           "a",            // Modelo
//           "get_by_u",    // Método
//           [
//             res_partner_de_este_usuario_tipo_aspiradora_no_es_un_cliente_ojo_son_dos_cosas_distintas_este_es_el_campo_u              // Valor de u que deseas buscar
//           ]
//         ]
//       },
//       "id": 1
//     };
//     //console.log('modelA body',body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }



//   public updateGranBoolField1(number:number,string:string,granId:number): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,   // Replace with your database name
//           number,     // Replace with your user ID
//           string,     // Replace with your password
//           "a", // Odoo model for quotations
//           "write",    // Method to update the quotation
//           [
//             [granId],      // ID of the quotation to update (replace with the actual ID)
//             {
//               "bool_field_1": true,  // Update the salesperson to user ID 9
//               "str_field_1": "tags"
//             }
//           ]
//         ]
//       },
//       "id": 1
//     };
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }


//   public updateGranStateToProduction(number:number,string:string,granId:number): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,   // Replace with your database name
//           number,     // Replace with your user ID
//           string,     // Replace with your password
//           "a", // Odoo model for quotations
//           "write",    // Method to update the quotation
//           [
//             [granId],      // ID of the quotation to update (replace with the actual ID)
//             {
//               "str_field_1": "production"
//             }
//           ]
//         ]
//       },
//       "id": 1
//     };
//     console.log('peticion updateGranStateToProduction ',body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }


//   public eliminarRegistrosModelAPorQuotationId(number:number,string:string,idQuotation:number): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,        // Nombre de la base de datos
//           number,               // ID del usuario
//           string, // Contraseña
//           "a",            // Modelo
//           "delete_records_by_q", // Método
//           [
//             idQuotation              // Valor de q que deseas eliminar
//           ]
//         ]
//       },
//       "id": 1
//     };
//     //console.log(body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public eliminarRegistrosModelAPorUserId(number:number,string:string,userAspiradoraPartnerId:number): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,        // Nombre de la base de datos
//           number,               // ID del usuario
//           string, // Contraseña
//           "a",            // Modelo
//           "delete_records_by_u", // Método
//           [
//             userAspiradoraPartnerId              // recuerde que se usa el partner_id de la aspiradora indformacion de res_partner tabla
//           ]
//         ]
//       },
//       "id": 1
//     };
//     //console.log(body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public deleteAllRecordsModelA(number:number,string:string): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,        // Nombre de la base de datos
//           number,               // ID del usuario
//           string, // Contraseña
//           "a",            // Modelo
//           "delete_all_records", // Método
//           []
//         ]
//       },
//       "id": 1
//     };
//     //console.log(body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }

//   public eliminarEstaDraft(number:number,string:string,draftId:number): Observable<any> {
//     const body = {
//       "jsonrpc": "2.0",
//       "method": "call",
//       "params": {
//         "service": "object",
//         "method": "execute_kw",
//         "args": [
//           environment.db,
//           number,
//           string,
//           "sale.order",
//           "unlink",
//           [
//             [draftId]  // Replace 'quotation_id' with the actual ID of the quotation to delete
//           ]
//         ]
//       },
//       "id": 1
//     };
//     //console.log(body)
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post(this.API_URL, body, { headers });
//   }


// }































// //   public createGran(number:number,string:string): Observable<any> {
// //     //Importante: cuando creo la oportunidad le pongo que el salesperson (o sea field 'use_id') es 2 (que es lmi usuario administrador , 
// //     //esto tiene un proposito , cuando voy a mostrar en la interfaz de usuario las elegidas yo valido si es diferente de 1 , voalaaa es porque esa es la elegida 
// //     // quiere decir que ese cam,po 'user_id'  se modifico
// //     //recuerda que ese campo solo se modifica cuando el salesaman (aspiradora) es elegida
// //     const body = {
// //       "jsonrpc": "2.0",
// //       "method": "call",
// //       "params": {
// //         "service": "object",
// //         "method": "execute_kw",
// //         "args": [
// //           environment.db,   // Reemplaza con tu base de datos
// //           number,
// //           string, // Reemplaza con tu contraseña
// //           "sale.order", // Modelo de Odoo para cotizaciones
// //           "create",    // Método de creación de cotización
// //           [
// //             {
// //               "partner_id": number,  // ID del cliente.
// //               "user_id": 2,  //user_id es el id del salesperson
// //               "patient_name":patient.name, 
// //               "patient_type_document":patient.type, 
// //               "patient_dni":patient.name, 
// //               "patient_area":patient.bed,
// //               "order_line": orderLine
// //             }
// //           ],
// //           {
// //             "context": {
// //               "mail_create_nosubscribe": true  // Prevent automatic email notification
// //             }
// //           }
// //         ], 
// //       },
// //       "id": 1
// //     };
// //     console.log('oportunidad que se creara dvd: ',body)
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }
















// //   public updateDraftUserId(number:number,string:string,draftId:number,userId:number): Observable<any> {
// //     const body = {
// //       "jsonrpc": "2.0",
// //       "method": "call",
// //       "params": {
// //         "service": "object",
// //         "method": "execute_kw",
// //         "args": [
// //           environment.db,   // Replace with your database name
// //           number,     // Replace with your user ID
// //           string,     // Replace with your password
// //           "sale.order", // Odoo model for quotations
// //           "write",    // Method to update the quotation
// //           [
// //             [draftId],      // ID of the quotation to update (replace with the actual ID)
// //             {
// //               "user_id": userId  // Update the salesperson to user ID 9
// //             }
// //           ]
// //         ]
// //       },
// //       "id": 1
// //     };
// //     console.log('user id updateDraftUserId: ',body)
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }

// //   public addSalesPersontoAnExistingQuotation(number:number,string:string,idQuotation:string): Observable<any> {
// //     const body = {
// //       "jsonrpc": "2.0",
// //       "method": "call",
// //       "params": {
// //         "service": "object",
// //         "method": "execute_kw",
// //         "args": [
// //           environment.db,       // Replace with your database name
// //           number,              // Replace with the user ID
// //           string, // Replace with your password
// //           "sale.order",   // Odoo model for quotations
// //           "write",        // Method to update the record
// //           [
// //             [idQuotation],         // ID of the quotation to update (replace with actual quotation ID)
// //             {
// //               "user_id": number  // ID of the salesperson (replace with actual salesperson ID)
// //             }
// //           ]
// //         ]
// //       },
// //       "id": 1
// //     };
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }

// //   //get grans
// //   public getDrafts(number:number,string:string): Observable<any> {
// //     const body = {
// //       "jsonrpc": "2.0",
// //       "method": "call",
// //       "params": {
// //         "service": "object",
// //         "method": "execute_kw",
// //         "args": [
// //           environment.db,
// //           number,
// //           string,
// //           "sale.order",
// //           "search_read",
// //           [[["state", "=", "draft"]]],
// //           {"fields": ["id", "name", "partner_id", "user_id", "note", "amount_total", "order_line",
// //           "patient_name", "patient_type_document", "patient_dni", "patient_area" ]}
// //         ]
// //       },
// //       "id": 1
// //     };
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }


// //   public getDraftByID(number:number,string:string,draftId:number): Observable<any> {
// //     const body = {
// //       "jsonrpc": "2.0",
// //       "method": "call",
// //       "params": {
// //         "service": "object",
// //         "method": "execute_kw",
// //         "args": [
// //           environment.db,
// //           number,
// //           string,
// //           "sale.order",
// //           "search_read",
// //           [[["id", "=", draftId]]],
// //           {"fields": ["id", "name", "partner_id", "user_id", "note", "amount_total", "order_line",
// //           "patient_name", "patient_type_document", "patient_dni", "patient_area" 
// //           ]}
// //         ]
// //       },
// //       "id": 1
// //     };
// //     console.log("getDraftByID que se consultara: ",body)
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }


// //   public getOrderLineDetails(number:number,string:string,orderLineIds: number[]): Observable<any> {
// //     const body = {
// //       jsonrpc: "2.0",
// //       method: "call",
// //       params: {
// //         service: "object",
// //         method: "execute_kw",
// //         args: [
// //           environment.db,
// //           number,
// //           string,
// //           "sale.order.line",
// //           "read",
// //           orderLineIds,
// //           {"fields": ["id", "product_id", "product_uom_qty"]}
// //         ]
// //       },
// //       id: 1
// //     };
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }

// //   public getAllSaleOrderLines(number:number,string:string,): Observable<any> {
// //     const body = {
// //       jsonrpc: "2.0",
// //       method: "call",
// //       params: {
// //         service: "object",
// //         method: "execute_kw",
// //         args: [
// //           environment.db,
// //            number,
// //            string,
// //           "sale.order.line",
// //           "search_read",
// //           [[]], // Empty domain to fetch all records
// //           {"fields": ["id", "order_id", "product_id", "product_uom_qty", "price_unit", "discount"]} // Specify fields you want to retrieve
// //         ]
// //       },
// //       id: 1
// //     };
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }

// // //get Grans
// //   public getSales(number:number,string:string): Observable<any> {
// //     const body =   {
// //       "jsonrpc": "2.0",
// //       "method": "call",
// //       "params": {
// //         "service": "object",
// //         "method": "execute_kw",
// //         "args": [
// //           environment.db,
// //           number,
// //           string,
// //           "sale.order",
// //           "search_read",
// //           [[["state", "=", "sale"]]],  // Filter for confirmed quotations (state = sale)
// //           {
// //             "fields": [
// //               "id", "name", "partner_id", "note", "amount_total", "order_line",
// //               "violet_score_salesperson", "violet_review_salesperson", "violet_review_client", 
// //               "violet_image_1920", "violet_is_delivery", "violet_is_insitu", "violet_quotation_note"
// //             ]
// //           }
// //         ]
// //       },
// //       "id": 1
// //     };
// //     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
// //     return this.http.post(this.API_URL, body, { headers });
// //   }
