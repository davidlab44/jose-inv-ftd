import { Component, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonList, IonRouterOutlet, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { Opportunity, ProductData } from '../../interfaces/opportunity';
import { OpportunityService } from '../../services/opportunity.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ViewWillEnter, ViewDidEnter, ViewWillLeave } from '@ionic/angular';
import { PosOrderService } from '../../services/pos-order.service';
import { StringDecoder } from 'string_decoder';

@Component({
  selector: 'page-speaker-list',
  templateUrl: 'speaker-list.html',
  styleUrls: ['./speaker-list.scss'],
})
export class SpeakerListPage implements OnInit,ViewWillEnter,ViewDidEnter,ViewWillLeave {
  
  // ios: boolean;
  // patientData: boolean =false;
  // dayIndex = 0;
  // queryText = '';
  // segment = 'all';
  // excludeTracks: any = [];
  // shownSessions: any = [];
  // groups: any = [];
  // confDate: string;
  // showSearchbar: boolean;
  // opportunities: Opportunity[] = [];
  // login:string = '';
  // name:string = '';
  // s:boolean = false;
  // storedNumber:number =0;
  // cid:string='';
  // cname:string='';
  // highlightedOpportunity:Opportunity = {
  //   id: 0,
  //   name: '',
  //   description: '',
  //   create_uid:[0,''],
  //   categ_id:[0,''],
  //   default_code: false,
  //   list_price: 0,
  //   qty_available: 0,
  //   image_1920:false
  // }
  // solicitudesEnviadas:number=0
  // capturedImage: string | undefined;
  // imagenCapturada:string = ''; 

  constructor(
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public router: Router,
    public routerOutlet: IonRouterOutlet,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private opportunityService: OpportunityService,
    private posOrderLineService:PosOrderService
  ) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
  }

  ionViewDidEnter() {
    //this.setSesion();
    
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
  }

  ngDoCheck() {
  }

  // storedObject:any;
  // setSesion(){
  //   const storedObject = localStorage.getItem('myObjectKey');
  //   if (storedObject) {
  //     const myObject = JSON.parse(storedObject);
  //     this.storedObject=myObject;
  //     console.log('stored Object',this.storedObject)
  //   }
  //   if(this.storedObject.id>0,this.storedObject.string.length>0){
  //     this.getDrafts();
  //   }else{
  //     this.router.navigateByUrl('/login');
  //   }
  // }

  // drafts: any[] = [];

  // getDrafts(){
  //   this.posOrderLineService.getDrafts(this.storedObject.id,this.storedObject.string).subscribe({
  //     next: (response: any) => {
  //       this.drafts=response.result;
  //       console.log('getDrafts ',response);
  //       this.getSaleOrderLines();
  //     },
  //     error: (error: any) => {
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('getDrafts complete');
  //     }
  //   });
  // }

  // serverSaleOrderLineList:any[]=[];
  // pendingPosOrders:any[]=[];

  // getSaleOrderLines(){
  //   this.posOrderLineService.getTodayPosOrderLines(this.storedObject.id,this.storedObject.string).subscribe({
  //     next: (response: any) => {
  //       this.serverSaleOrderLineList=response.result;
  //       console.log('getTodayPosOrderLines response : ',response);
  //       this.getDrinks();
  //     },
  //     error: (error: any) => {
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //     }
  //   });
  // }

  // modifiedServerSaleOrderLineList:any[]=[];

  // pol:any

  // getDrinks(){
  //   let elementId1:any
  //   this.pol={};
  //   this.modifiedServerSaleOrderLineList=[]
  //   this.opportunityService.getDrinks(this.storedObject.id,this.storedObject.string).subscribe({
  //     next: (response: any) => {
  //       console.log('getDrinks response : ',response);
  //       this.serverSaleOrderLineList.forEach((pol, indx) => {
  //         if(pol.notice==false){
  //           this.removeLine(pol.order_id[0],pol.id)
  //         }
  //       });
      
  //       this.serverSaleOrderLineList.forEach((posOrderLine, ind) => {
  //         posOrderLine.isbar=false;
  //         response.result.forEach((bebida, indice) => {
  //           if(posOrderLine.product_id[0]==bebida.id){
  //             posOrderLine.isBar = true;
  //           }
  //           this.pol=posOrderLine
  //           console.log(this.pol)
  //         });
  //         this.modifiedServerSaleOrderLineList.push(this.pol);
  //       });
        
  //       console.log('modifiedServerSaleOrderLineList: ',this.modifiedServerSaleOrderLineList);
  //     },
  //     error: (error: any) => {
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //     }
  //   });
  // }
  
  // isLinePresent(draftLines: any[], line: any): boolean {
  //   return draftLines.some(draftLine => draftLine.id === line.id);
  // }

  // removeLine(draftId: number, line: any){
  //   this.drafts.forEach((draft, index) => {
  //     if(draft.id==draftId){
  //       draft.lines= draft.lines.filter(draftLine => draftLine.id !== line.id);
  //     }
  //   });
  // }

  // updatePosOrderLinesState(draft:any){
  //   console.log("gghhhh")
  //   console.log("gghhhh",draft)

  // }

  // updateSchedule() {
  // }

  // base64Image: string = ''; 
  // imageCharCount: number = 0; 
  // imageCapturadaSize: number = 0;

  // getImageUrl(base64Image: string): string {
  //   this.imageCapturadaSize = base64Image.length; 
  //   return `data:image/jpeg;base64,${base64Image}`;
  // }

  // onImageSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       this.base64Image = e.target.result.split(',')[1];
  //       this.imageCharCount = this.base64Image.length;
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  // clearLocalStorage(): void {
  //   localStorage.clear();
  //   console.log('LocalStorage has been cleared.');
  // }


  ngOnChanges(changes: any) {
    console.log('ngOnChanges: Cambios en las propiedades de entrada:', changes);
    alert('ngOnChanges: Cambios en las propiedades de entrada:');
  }

}



























  // eliminarDraft(draftId:number){
  //   //############################
  //   //ELIMINAR LOS DETALLES ASOCIADOS PRIMERAMENTE

  //   this.saleOrderService.deleteDraftById(this.storedObject.id,this.storedObject.string,draftId).subscribe({
  //     next: (response: any) => {
  //       //this.drafts=response.result;
  //       console.log('deleteDraftById ',response);
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('getDrafts complete');
  //     }
  //   });

  //   this.mrpBomService.deleteMrpBom(this.storedObject.id,this.storedObject.string,draftId).subscribe({
  //     next: (response: any) => {
  //       //this.drafts=response.result;
  //       console.log('deleteMrpBom ',response);
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       //console.log('deleteMrpBom complete');
  //     }
  //   });

  // }



  // asignaciones paciente
  // setPatient(){
  //   if(this.patient.name.length>2 && this.patient.dni.length>1){
  //     this.isPatientFilled =true;
  //     this.createGran();
  //   }else{
  //     alert('Faltan datos importantes')
  //   }
  // }

  // setTipoDoc(id:number){
  //   this.patient.type=id
  // }

  // asignaciones bom
  //fill lines: vehiculo,vias,presentacion y t.infusion




  // concentracionMgQty=0
  // setConcentracionMg(product_util_id:number,cantidad:any): void {
  //   cantidad=Number(cantidad)
  //   this.concentracionMgQty=cantidad;
  // }

  // concentracionMlQty=0
  // setConcentracionMl(product_util_id:number,cantidad:any): void {
  //   cantidad=Number(cantidad)
  //   this.concentracionMlQty=cantidad;
  // }

  // concentracionUiQty=0
  // setConcentracionUi(product_util_id:number,cantidad:any): void {
  //   cantidad=Number(cantidad)
  //   this.concentracionUiQty=cantidad;
  // }

  //seleccionar el active product selected de esta manera mas pro
  //event.detail.value.id
  //cuando se cambia de color a rojo 
  //seleccionarlos asi  event.detail.value.id
  //para ir haciendo las cosas mas angularosamente y mas ionicamente




  // consultarSiHayGrandInModifyingState(){
  //   this.saleOrderService.createQuotation(this.storedObject.id,this.storedObject.string,this.patient,this.orderLines).subscribe({
  //     next: (response: any) => {
  //       this.grandList =response.result;
  //       console.log('consultarSiHayGrandInModifyingState ',response.result);
  //       // console.log('id de la draft creada ',response.result);
  //       // if(Number(response.result) ){
  //       //   localStorage.setItem('draftId',response.result)
  //       // }else{
  //       //   alert('no se ha podido crear la orden')
  //       // }
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('grandList complete');
  //       // if(this.grandList.length>0){
  //       //   this.grandList.forEach((item, index) => {
  //       //     if(!item.bool_field_1){
  //       //       this.granId = item.id
  //       //     }else('todas las ordenes de pedido estan es estado: QF')
  //       //   });
  //       // }else{
  //       //   alert('cannot find any gran-list')
  //       // }
  //     }
  //   });
  // }



  // getDrafts(){
  //   this.saleOrderService.getDrafts(this.storedObject.id,this.storedObject.string).subscribe({
  //     next: (response: any) => {
  //       this.drafts=response.result;
  //       console.log('getDrafts ',this.drafts);
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('getDrafts complete');
  //     }
  //   });
  // }

  // agregarProductoAlaDraft(product_tmpl_id:number){
  //   this.saleOrderService.addSaleOrderLine(this.storedObject.id,this.storedObject.string,product_tmpl_id,this.mrpBomLinesMadre).subscribe({
  //     next: (response: any) => {
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('modelA complete');
  //       this.agregarProductoAlaDraft(this.product_tmpl_id)
  //     }
  //   });
  // }

  // eliminarMrpBom(){
  //   this.product_tmpl_id=39
  //   this.mrpBomService.eliminarMrpBom(this.storedObject.id,this.storedObject.string,this.product_tmpl_id,this.mrpBomLinesMadre).subscribe({
  //     next: (response: any) => {
  //       console.log('peticion, createMrpBom que se creo es: ',response.result);
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       //console.log('createMrpBom complete');
  //       this.agregarProductoAlaDraft(this.product_tmpl_id)
  //     }
  //   });
  // }
  
  // removerProductoDelaDraft(product_tmpl_id:number){
  //   this.saleOrderService.removerProductoDelaDraft(this.storedObject.id,this.storedObject.string,this.product_tmpl_id,this.mrpBomLinesMadre).subscribe({
  //     next: (response: any) => {
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('modelA complete');
  //     }
  //   });
  // }


  // // update draft details
  // agregarElementoAlPedido(){
  //   console.log("elementosdelpedido length", this.elementosDelPedido.length)
  //   this.elementosModificados = this.elementosDelPedido.filter(item => item.id == this.bom.id);
  //   console.log("elementosModificados length", this.elementosModificados.length)
  //   if(this.elementosModificados.length>0){
  //     this.elementosDelPedido=this.elementosDelPedido.filter(item => item.id !== this.bom.id);
  //   }
  //   this.elementosDelPedido.push(this.bom);
  //   console.log("lista de elementosDelPedido", this.elementosDelPedido)
  // }


  // setMixAtributes(mix:any){
  //   const id = mix.id;
  //   console.log('mix id',mix.id)
  //   // Remove the element with id 41
  //   this.elementosDelPedido = this.elementosDelPedido.filter(item => item.id !== id);
  //   this.elementosDelPedido.push(this.mix);

  //   this.mix = {
  //     id: 0,
  //     name: '',
  //     description: '',
  //     create_uid: [0, ''],
  //     categ_id: [0, ''],
  //     default_code: false,
  //     list_price: 0,
  //     qty_available: 0,
  //     image_1920: false,
  //     presentacion: 0,
  //     vehicle: 0,
  //     volumen_final: 0,
  //     concentracion_mg: 0
  //   }
  //   this.mixVisibility=false;
  // }


  // highlightThisOpportunity(opportunity:Opportunity){
  //   this.highlightedOpportunity =opportunity;
  //   console.log("prueba")
  // }




  // enviarPedido(){
  //   this.saleOrderService.createQuotation(this.retrievedNumber,this.retrievedString,this.draftInfo,this.orderLines).subscribe({
  //     next: (response: any) => {
  //       //this.modelA = response.result;
  //     },
  //     error: (error: any) => {
  //       //alert('Error: ' + error);
  //       console.log('Error: ' + error);
  //     },
  //     complete: () => {
  //       console.log('modelA complete');
  //     }
  //   });
  // }
