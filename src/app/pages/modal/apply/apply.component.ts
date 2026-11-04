import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, Config, IonList, LoadingController, ModalController, NavController, ToastController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserData } from '../../../providers/user-data';
import { ConferenceData } from '../../../providers/conference-data';
import { ResUser } from '../../../interfaces/res-user';
import { UserService } from '../../../services/user.service';
import { UtilService } from '../../../services/util.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.css'
})
export class ApplyComponent implements OnInit,ViewWillEnter,ViewDidEnter {
  @Input() items: any[]; // The list of items to display
  @Input() detalles: any[]; // The list of items to display
  product: any;
  publishVisibility=true;
  ios: boolean;
  categories:any[]=[];
  ums:any[]=[];
  componentsEnabled: boolean = true;
  
  constructor(
    private modalController: ModalController,
    public router: Router,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private utilService: UtilService,
    private productService:ProductService,
    private navController: NavController,
  ){}

  ngOnInit(): void {    //console.log('red',this.items)
    this.product=this.items[0];    console.log('chamba',this.items[0])
    this.categories=this.detalles[0];    console.log('categorie',this.detalles[0])
    this.ums=this.detalles[1];   console.log('ums',this.detalles[0])
  }

  ionViewWillEnter(): void { } ionViewDidLeave(): void { }   ionViewWillLeave(): void {}
  async ionViewDidEnter(): Promise<void> {
  }

  dismissModal() { 
    this.modalController.dismiss({
      closedBy: 'customCloseModal',
      extraData: { foo: 'bar' }
    }); 
  }

  idCmscoreModelRow:number=0
  storedObject:ResUser;
  p:any;

  getCategoryNameById(id: number | null | undefined): string {                                                                                                                         
    if (id === null || id === undefined) {
      return 'Sin categoría';     
    }
    if (!Array.isArray(this.categories) || this.categories.length === 0) {
      return 'Sin categoría';     
    }
    const cat = this.categories.find(c => Number(c.id) === Number(id));
    const nombre = cat?.datos?.nombre;
    return typeof nombre === 'string' && nombre.trim() !== ''
      ? nombre
      : 'Sin categoría';          
  }

  getUmNameById(id: number | string): string {
    const idNum = Number(id);
    const um = this.ums.find(u => Number(u.id) === idNum);
    return um?.datos?.name ? um.datos.name : 'Sin UM';
  }

  extraQty = 0;
  clearQty() {
    this.extraQty = 0;
  }

  addQty(value: number) {
    const allowedCant = Number(this.product?.datos?.qty) - value;
    console.log("allowed", allowedCant);
    if (Number.isNaN(allowedCant)) {
      this.utilService.presentToast("allowedCant is NaN", "danger", 500);
      return; // salimos de la función
    }
  }

  confirmAction() {
    const newQty = this.product.datos.qty - this.extraQty;
    console.log("newQty",newQty)
    if (newQty >= 0) {
      this.product.datos.qty = newQty;
      this.updateProductQty(this.product.id, this.product);
    } else {
      this.utilService.presentToast("No tiene suficiente stockk", "default", 1000);
    }
  }

 updateProductQty(productId:number,datos:any){
    this.productService.updateProductQty(productId, datos).subscribe({
      next: (res) => {       
        console.log('Cantidad actualizada:', res);
      },  
      error: (err) => {
        console.error('Error al actualizar cantidad:', err);
      } 
    }); 
  }


}
