import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { OpportunityService } from '../../services/opportunity.service';
import { PosOrderService } from '../../services/pos-order.service';
import { TableService } from '../../services/table.service';
import { environment } from '../../../environments/environment';
import { ActivatedRoute } from '@angular/router'
import { Session } from '../../interfaces/session';
import { SessionService } from '../../services/session.service';
import { UtilService } from '../../services/util.service';

@Component({
  selector: 'page-order',
  templateUrl: 'order.html',
  styleUrls: ['./order.scss'],
})
export class OrderPage {
  // @ViewChild('scheduleList', { static: true }) scheduleList: IonList;

  ios: boolean;
  segment = 'all';
  showSearchbar: boolean;
  opportunities = [];
  storedObject: any;
  posOrders: any[] = [];
  posOrderLineList: any[] = [];
  pendingCommands: any[] = [];
  deliveredList: any[] = [];
  productList: any[] = [];
  filteredProductList: any[] = [];
  maxQtyDeliveredItems: any[] = [];
  queryText:any
  mesas: any[] = [];
  activeSession: Session | null = null;
  sessionId: number | null = null;

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private opportunityService: OpportunityService,
    private posOrderService: PosOrderService,
    private tableService: TableService,
    private route: ActivatedRoute,
    private sessionService:SessionService,
    private utilService:UtilService
  ) {}

  groupedOrder: any = {};
  hash:string='';
  ngOnInit() {
    // Recuperar session_id desde localStorage
    const mesa_id = localStorage.getItem("mesa_id");
    if (!mesa_id || !Number(mesa_id)) {
      this.utilService.presentToast("No hay mesa activa, reiniciar app", 'danger',1000);
    }else{
      console.log("mesa",mesa_id)
    }
    this.getActiveSession();
    this.getPosCategories();
    console.log("ngOnInit")
    this.groupedOrder = this.getGroupedOrder();
  }




  getGroupedOrder() {
    const order: any[] = JSON.parse(localStorage.getItem('order') || '[]');
    //console.log("orden",order)
    const grouped: { [key: number]: any[] } = {};
    order.forEach((product) => {
      const categId = product.posCategId || 0;
      if (!grouped[categId]) {
        grouped[categId] = [];
      }
      grouped[categId].push(product);
    });
    const result = Object.keys(grouped).map((categId) => {
      const cat = this.posCategories.find((c: any) => c.id === +categId);
      const categoryName = cat ? cat.name : "Sin categoría";
      return {
        id: +categId,
        name: categoryName,
        products: grouped[+categId],
      };
    });
    return result;
  }


  clearOrder() {
     this.router.navigateByUrl('/login?table=33', { replaceUrl: true });
  }


  posCategories: any[] = [];
  getPosCategories() {
    this.opportunityService.getPosCategories(environment.i, environment.p).subscribe({
      next: response => {
        this.posCategories = response.result;
        console.log("posCategories", this.posCategories);
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }




  updateOrder(){
    this.filteredProductList = this.searchProducts(this.queryText, this.productList);
    console.log("sin filtrar",this.productList);
    console.log("filtered",this.filteredProductList);
    if(this.filteredProductList && this.filteredProductList.length && this.filteredProductList.length==0){
      this.filteredProductList=this.productList
    }
  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter")
  }



  session: any;
  getActiveSession() {
    this.sessionService.getActiveSession(environment.i, environment.p).subscribe({
      next: (session: Session | null) => {
        console.log('getActiveSession', session);

        if (session) {
          this.activeSession = session;
          this.sessionId = session.id;

          console.log('ID de la sesión:', this.sessionId);

          // 👉 Guardamos en localStorage
          localStorage.setItem('current_pos_session', JSON.stringify(session));
        } else {
          console.log('No hay sesión activa');
          // 👉 Borramos la clave si no hay sesión
          localStorage.removeItem('current_pos_session');
        }
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }



  searchProducts(hash: string, productList: any[]): any[] {
    if (!hash || hash.trim() === '') return productList;
    return productList.filter(product =>
      product.name.toLowerCase().includes(hash.toLowerCase())
    );
  }
 


  enviarOrder() {
    // Leer carrito
    const order = JSON.parse(localStorage.getItem('order') || '[]');

    if (!order.length) {
      this.utilService.presentToast("El pedido está vacío",'danger',1000);
      return;
    }

    // Calcular subtotal
    const subtotal: number = order.reduce(
      (sum: number, item: any) => sum + (item.price * item.cant),
      0
    );

    // Calcular taxes (10%)
    const taxes: number = +(subtotal * 0.10).toFixed(2);

    // Calcular total
    const total: number = subtotal + taxes;

    // Recuperar session_id desde localStorage
    const mesa_id = localStorage.getItem("mesa_id");
    if (!mesa_id || !Number(mesa_id)) {
      this.utilService.presentToast("No hay mesa activa, reiniciar app", 'danger',1000);
      return;
    }

    const sessionData = localStorage.getItem("current_pos_session");
    if (!sessionData) {
      this.utilService.presentToast("No hay POS session activa, reiniciar app", 'danger',1000);
      return;
    }


    const session = JSON.parse(sessionData);
    const currentPosSessionId = session.id;

    console.log("subtotal:", subtotal, "taxes:", taxes, "total:", total);
    console.log("currentPosSessionId:", currentPosSessionId);

    const uid = localStorage.getItem('current_order_uid');

    this.opportunityService
      .createPosOrder(environment.i, environment.p, order, subtotal, taxes, total, currentPosSessionId,uid,mesa_id)
      .subscribe({
        next: (res) => {
          console.log("Orden creada en Odoo:", res);
          alert("Orden enviada con éxito ✅");
          localStorage.removeItem("order"); // Vaciar carrito
        },
        error: (err) => {
          console.error("Error al enviar orden:", err);
          alert("Error al enviar la orden ❌");
        },
      });
  }





// enviarOrder() {
//   // Leer carrito
//   const order = JSON.parse(localStorage.getItem('order') || '[]');

//   if (!order.length) {
//     alert("El pedido está vacío");
//     return;
//   }

//   // Calcular subtotal
//   const subtotal: number = order.reduce(
//     (sum: number, item: any) => sum + (item.price * item.cant),
//     0
//   );

//   // Calcular taxes (10%)
//   const taxes: number = +(subtotal * 0.10).toFixed(2);

//   // Calcular total
//   const total: number = subtotal + taxes;

//   console.log("subtotal:", subtotal, "taxes:", taxes, "total:", total);

//   this.opportunityService
//     .createPosOrder(environment.i, environment.p, order, subtotal, taxes, total)
//     .subscribe({
//       next: (res) => {
//         console.log("Orden creada en Odoo:", res);
//         alert("Orden enviada con éxito ✅");
//         localStorage.removeItem("order"); // Vaciar carrito
//       },
//       error: (err) => {
//         console.error("Error al enviar orden:", err);
//         alert("Error al enviar la orden ❌");
//       },
//     });
// }



//  enviarOrder() {
//   // Leer carrito
//   const order = JSON.parse(localStorage.getItem('order') || '[]');

//   if (!order.length) {
//     alert("El pedido está vacío");
//     return;
//   }

//   ///chatgpt aqui computar ,subtotal,taxes,total
  
//   this.opportunityService.createPosOrder(environment.i, environment.p,subtotal,taxes,total)
//     .subscribe({
//       next: (res) => {
//         console.log("Orden creada en Odoo:", res);
//         alert("Orden enviada con éxito ✅");

//         // Vaciar carrito
//         localStorage.removeItem('order');
//       },
//       error: (err) => {
//         console.error("Error al enviar orden:", err);
//         alert("Error al enviar la orden ❌");
//       }
//     });
//   }


  // addToOrder(product: any, cant: number) {
  //   // cantidad disponible en inventario
  //   const availableQuantity = product.qty_available;

  //   // Traer la lista actual del carrito
  //   let order: any[] = JSON.parse(localStorage.getItem('order') || '[]');

  //   // Buscar si el producto ya existe en la orden
  //   const existing = order.find(item => item.id === product.id);

  //   if (existing) {
  //     // Verificar que no supere el stock
  //     if (existing.cant + cant <= availableQuantity) {
  //       existing.cant += cant;
  //     } else {
  //       alert(`No puedes agregar más de ${availableQuantity} unidades de ${product.display_name || product.name}`);
  //       return;
  //     }
  //   } else {
  //     // Verificar stock al agregar la primera vez
  //     if (cant <= availableQuantity) {
  //       order.push({
  //         id: product.id,
  //         name: product.display_name || product.name,
  //         price: product.list_price,
  //         cant: cant
  //       });
  //     } else {
  //       alert(`Stock insuficiente, solo hay ${availableQuantity} unidades de ${product.display_name || product.name}`);
  //       return;
  //     }
  //   }
  //   // Guardar de nuevo en localStorage
  //   localStorage.setItem('order', JSON.stringify(order));
  // }

 


  getLast24HoursPosOrders() {
    this.posOrderService.getLast24HoursPosOrders(environment.i, environment.p).subscribe({
      next: response => {
        this.posOrders = response.result;
        this.getLast24HoursPosOrderLines();
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

  getLast24HoursPosOrderLines() {
    this.posOrderService.getLast24HoursPosOrderLines(environment.i, environment.p).subscribe({
      next: response => {
        this.posOrderLineList = response.result;
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }


  getPosOrderLineDeliveredList() {
    this.posOrderService.getPosOrderLineDeliveredList(environment.i, environment.p).subscribe({
      next: response => {
        this.deliveredList = response.result;
        this.processOrders();
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

  private processOrders() {
    this.pendingCommands = [];
    
    this.posOrderLineList.forEach(polItem => {
      polItem.isBar = !!this.productList.find(beer => beer.id === polItem.product_id[0]);
      
      const order = this.posOrders.find(item => item.id === polItem.order_id[0]);
      polItem.mesa = order?.table_id[0] || null;
      polItem.mesaName = (this.mesas.find(m => m.id === order?.table_id[0] ) || {}).name || null;
      this.findMaxQtyDelivered(polItem.order_id[0], polItem.product_id[0]);
      this.calculatePendingCommands(polItem);
    });
  }

  private findMaxQtyDelivered(orderId: number, productId: number) {
    this.maxQtyDeliveredItems = this.deliveredList
      .filter(item => item.order_id === orderId && item.product_id === productId)
      .sort((a, b) => b.qty - a.qty);
  }

  private calculatePendingCommands(polItem: any) {
    const maxDelivered = this.maxQtyDeliveredItems[0]?.int_field_1 || 0;
    polItem.diferencia = polItem.qty - maxDelivered;
    
    if (polItem.diferencia > 0 && !polItem.isBar && polItem.mesa>0 && polItem.mesaName.length>0) {
      this.pendingCommands.push(polItem);
    }
  }

  updatePosOrderLine(order_id: any, product_id: any, qty: any) {
    this.posOrderService.updatePosOrderLineDelivered(environment.i, environment.p, order_id, product_id, qty).subscribe({
      next: response => {
        console.log('updatePosOrderLineDelivered response:', response.result);
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

  markAsDispatched(event: any, posOrderLine: any) {
    if (event.detail.checked) {
      console.log(`Plato despachado: ${posOrderLine.product_id[1]}`);
    } else {
      console.log(`Plato desmarcado: ${posOrderLine.product_id[1]}`);
    }
    this.updatePosOrderLine(posOrderLine.order_id[0], posOrderLine.product_id[0], posOrderLine.qty);
  }

  getMesas() {
    this.tableService.getTables(environment.i, environment.p).subscribe({
      next: response => {
        this.mesas = response.result;
      },
      error: error => console.error('Error:', error),
      complete: () => {}
    });
  }

}




