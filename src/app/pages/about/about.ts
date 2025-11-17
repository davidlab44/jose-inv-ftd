import { Component, OnInit } from '@angular/core';

import { PopoverController, ViewDidEnter } from '@ionic/angular';

import { PopoverPage } from '../about-popover/about-popover';
import { ObjectToPrint } from '../../interfaces/object-to-print';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html',
  styleUrls: ['./about.scss'],
})
export class AboutPage implements OnInit,ViewDidEnter{


  constructor(){}

  ngOnInit(): void {
    console.log('entro');
    //throw new Error('Method not implemented.');
  }

  ionViewDidEnter() {
    this.setSesion();
    // console.log('ionViewDidEnter');
    // if(this.s == false){
    //   alert('fuera!')
    //   //this.router.navigateByUrl('/login');
    // }
  }

  // setSesion(){
  //   const objectToPrint = localStorage.getItem('objectToPrint');
  //   if (objectToPrint) {
  //     this.objectToPrint = JSON.parse(objectToPrint);
  //     console.log('objectToPrint: ',this.objectToPrint );
  //   }
  // }


  // objectToPrint: {
  //   draft: {
  //     patient_name:''
  //   },
  //   mrpBom:{
  //     product_tmpl_id:[0,'']
  //   },
  //   objectToPrintMrpBomLines:[
  //     {id:'',product_tmpl_id:0}
  //   ],
  //   temperaturaCaliente:'',
  //   temperaturaFria:'',
  //   observaciones:''
  // } | null = null;


  objectToPrint: ObjectToPrint = {
    granId: 0,
    sol: {
      id: 0,
      order_id: [0, ''],
      product_id: [0, ''],
      productUomQty: 0,
      priceUnit: 0,
      discount: 0
    },
    mrpBom: {
      id: 0,
      analytic_distribution: false,
      analytic_distribution_search: false,
      analytic_precision: 0,
      message_is_follower: false,
      message_follower_ids: [],
      message_partner_ids: [],
      message_ids: [],
      has_message: false,
      message_needaction: false,
      message_needaction_counter: 0,
      message_has_error: false,
      message_has_error_counter: 0,
      message_attachment_count: 0,
      website_message_ids: [],
      message_has_sms_error: false,
      code: false,
      active: false,
      type: '',
      product_tmpl_id: [0, ''],
      product_id: [0, ''],
      bom_line_ids: [],
      byproduct_ids: [],
      product_qty: 0,
      product_uom_id: [0, ''],
      product_uom_category_id: [0, ''],
      sequence: 0,
      operation_ids: [],
      ready_to_produce: '',
      picking_type_id: false,
      company_id: [0, ''],
      consumption: '',
      possible_product_template_attribute_value_ids: [],
      allow_operation_dependencies: false,
      produce_delay: 0,
      days_to_prepare_mo: 0,
      display_name: '',
      create_uid: [0, ''],
      create_date: '',
      write_uid: [0, ''],
      write_date: '',
      analytic_distribution_text: false,
      analytic_account_ids: [],
      str_field_1: '',
      str_field_2: '',
      str_field_3: '',
      str_field_4: '',
      str_field_5: '',
      bool_field_1: false,
      bool_field_2: false,
      bool_field_3: false,
      bool_field_4: false,
      bool_field_5: false,
      sale_image_1920: false,
      int_field_1: 0,
      int_field_2: 0,
      int_field_3: 0,
      int_field_4: 0,
      int_field_5: 0
    },
    draft: {
      id: 0,
      int_field_1: 0,
      patient_name: '',
      patient_type_document: 0,
      patient_dni: '',
      patient_area: ''
    },
    cantidad: {},
    mrpBomLinesMadre: {},
    qfLibera: '',
    qfElabora: '',
    mrpBomLinePresentacion: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    mrpBomLineVia: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    mrpBomLineTinfusion: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    mrpBomLineVehiculo: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    mrpBomLineConcentracionMg: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    mrpBomLineConcentracionMl: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    mrpBomLineConcentracionUi: {
      product_id: 0,
      product_qty: 0,
      product_uom_id: 0,
      str_field_5: ''
    },
    temperaturaCaliente: '',
    temperaturaFria: '',
    observaciones: ''
  };


  setSesion() {
    const objectToPrint = localStorage.getItem('objectToPrint');
    if (objectToPrint) {
      try {
        this.objectToPrint = JSON.parse(objectToPrint);
        console.log('objectToPrint: ', this.objectToPrint);

      } catch (error) {
        console.error('Error parsing objectToPrint:', error);
        //this.objectToPrint = ; // Set to an empty object if parsing fails
      }
    } else {
      //this.objectToPrint = {}; // Initialize as empty if not found
    }
  }

  formatCurrentDate(): string {
    const now = new Date();
    // Create a formatter for a human-friendly date and time
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat('es-CO', options);
    return formatter.format(now);
  }

  formatCurrentTime(): string {
    const now = new Date();
    // Create a formatter for a human-friendly date and time
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // Use 12-hour format
    };

    const formatter = new Intl.DateTimeFormat('es-CO', options);
    return formatter.format(now);
  }


  formatLote(): string {
    const now = new Date();
    
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = now.getDate().toString().padStart(2, '0');
    const hour = now.getHours().toString().padStart(2, '0');
    const minute = now.getMinutes().toString().padStart(2, '0');
  
    return `${year}${month}${day}${hour}${minute}`;
  }


  // formatLote(): string {
  //   const now = new Date();
  //   // Create a formatter for a human-friendly date and time
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false, // Use 12-hour format
  //   };
  //   return options.toString();
  // }
  

  // getProduct(){
    
  //   // this..updateMrpBom(this.storedObject.id,this.storedObject.string,this.objectToPrint.mrpBom.id,this.selectedProductCantidad,arrayIdsLineasQueSeVanAModificar,this.mrpBomLinesMadre).subscribe({
  //   //   next: (response: any) => {
  //   //     //registrar detalleDraft
  //   //     this.addSaleOrderLine()
  //   //     console.log('peticion, createMrpBom response: ',response.result);
  //   //     //this.modelA = response.result;
  //   //   },
  //   //   error: (error: any) => {
  //   //     //alert('Error: ' + error);
  //   //     console.log('Error: ' + error);
  //   //   },
  //   //   complete: () => {
  //   //     //console.log('createMrpBom complete');
  //   //     //this.agregarProductoAlaDraft(this.product_tmpl_id)
  //   //   }
  //   // product_tmpl_id
  // }
  
  
  // location = 'madison';
  // conferenceDate = '2047-05-17';

  // selectOptions = {
  //   header: 'Select a Location'
  // };

  // constructor(public popoverCtrl: PopoverController) { }

  // async presentPopover(event: Event) {
  //   const popover = await this.popoverCtrl.create({
  //     component: PopoverPage,
  //     event
  //   });
  //   await popover.present();
  // }
}
