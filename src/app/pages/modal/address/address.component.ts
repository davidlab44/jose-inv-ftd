import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, Config, IonList, LoadingController, ModalController, ToastController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { UserData } from '../../../providers/user-data';
import { ConferenceData } from '../../../providers/conference-data';
import { ResUser } from '../../../interfaces/res-user';
import { UserService } from '../../../services/user.service';
import { AddressService } from '../../../services/address.service';
import { environment } from '../../../../environments/environment';
import { state } from '../../../interfaces/location';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent implements OnInit,ViewWillEnter,ViewDidEnter {
  @Input() address: any;

  constructor(
    private modalController: ModalController,
    public router: Router,
    private opportunityService: OpportunityService, 
    public alertCtrl: AlertController,
    public confData: ConferenceData,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public user: UserData,
    public config: Config,
    private userService:UserService,
    private addressService:AddressService,
    private http: HttpClient
  ){}

  showCities=false;
  stateName:any
  setState(event:any) {
    if(event && event.detail && event.detail.value){
      this.address.int_field_3=event.detail.value;
      this.states.forEach((item,index)=>{
        if(item.id==event.detail.value){
          this.address.str_field_3=item.name;
        }
      });
      this.getCitiesByStateId(event.detail.value);
      this.showCities=true;
    }
  }

  //cityName:any
  setCity(event:any) {
    this.address.str_field_4=event.detail.value
  }

  //huerfanoStateName:any;
  cities2: any[] = [];
  getCitiesByStateId(stateId: number=674): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.http.get('/assets/data/city.json').subscribe(
        (data: any) => {
          const state = data.cities.find((item: any) => item.state_id === stateId);
          if (state) {
            resolve(state.ciudades);
            console.log('cities',state.ciudades)
            this.cities2=state.ciudades
            this.address.str_field_4=this.cities2[0];
          } else {
            resolve([]);
          }
        },
        (error) => {
          console.error('Error loading city data:', error);
          reject(error);
        }
      );
    });
  }

  isCreate=false;
  ngOnInit(): void {
    console.log('address in modal',this.address);
    this.address.str_field_2='Colombia';
    this.address.int_field_2=49;
    if(!this.address.int_field_3 || this.address.int_field_3<1 ){
      this.isCreate=true;
      // this.address.str_field_3='Cundinamarca';
      // this.address.int_field_3=660;
    }else{
      this.showCities=true;
    }
  }

  ionViewWillEnter(): void {
    console.log('ionViewDidEnter')
  }
  
  async ionViewDidEnter(): Promise<void> {
    console.log('ionViewDidEnter')
    await this.setSesion();
    this.getStatesByCountryId();
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  storedObject:ResUser;
  p:any;
  async setSesion() {
    this.p=localStorage.getItem('p');
    this.storedObject = await this.userService.getStoredUserInfo();
    console.log("userInfo",this.storedObject)
    console.log("p",this.p)
    console.log("userInfo",this.storedObject)
  }

  ionViewDidLeave(): void {
    // throw new Error('Method not implemented.');
  }

  ngOnChanges(changes: any) {
    console.log('ngOnChanges: Cambios en las propiedades de entrada:', changes);
    alert('ngOnChanges: Cambios en las propiedades de entrada:');
  }

  ionViewWillLeave(): void {
    console.log("client.ionViewWillLeave")
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

  createAddress(){
    if(!this.address){
      this.presentToast("La dirección ingresada,no es valida",'danger');
      this.reloadPage();
      return;
    }
    if(!this.address.str_field_3 || !this.address.str_field_3.length || this.address.str_field_3.length<6 ){
      this.presentToast("El departamento "+this.address.str_field_3+" ingresado, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_4 || !this.address.str_field_4.length || this.address.str_field_4.length<4 ){
      this.presentToast("La ciudad ingresada, no es valida",'danger');
      return;
    }
    if(!this.address.str_field_5 || !this.address.str_field_5.length || this.address.str_field_5.length<6 ){
      this.presentToast("La Direccion ingresada, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_6 || !this.address.str_field_6.length || this.address.str_field_6.length<6 ){
      this.presentToast("El Barrio ingresado, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_7 || !this.address.str_field_7.length || this.address.str_field_7.length<6 ){
      this.presentToast("El Sector, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_7 || !this.address.str_field_7.length || this.address.str_field_7.length<6 ){
      this.presentToast("El Punto de referencia, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_1 || !this.address.str_field_1.length || this.address.str_field_1.length<6 ){
      this.presentToast("El Alias / Nombre de la dirección ingresado, no es valido",'danger');
      return;
    }
    this.addressService.createAddress(this.storedObject.id,this.p,this.address).subscribe(
      (response:any) => {
        console.log('createAddress creada:',response);
        console.log('createAddress creada:',response);
        if(response.result){
          this.presentToast('Dirección creada exitosamente');
          this.dismissModal();
        }
      },
      (error) => {
        alert('Error:'+ error);
      }
    );
  }

  updateAddress(){
    if(!this.address){
      this.presentToast("La dirección ingresada,no es valida",'danger');
      this.reloadPage();
      return;
    }
    if(!this.address.str_field_3 || !this.address.str_field_3.length || this.address.str_field_3.length<6 ){
      this.presentToast("El departamento "+this.address.str_field_3+" ingresado, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_4 || !this.address.str_field_4.length || this.address.str_field_4.length<4 ){
      this.presentToast("La ciudad ingresada, no es valida",'danger');
      return;
    }
    if(!this.address.str_field_5 || !this.address.str_field_5.length || this.address.str_field_5.length<6 ){
      this.presentToast("La Direccion ingresada, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_6 || !this.address.str_field_6.length || this.address.str_field_6.length<6 ){
      this.presentToast("El Barrio ingresado, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_7 || !this.address.str_field_7.length || this.address.str_field_7.length<6 ){
      this.presentToast("El Sector, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_7 || !this.address.str_field_7.length || this.address.str_field_7.length<6 ){
      this.presentToast("El Punto de referencia, no es valido",'danger');
      return;
    }
    if(!this.address.str_field_1 || !this.address.str_field_1.length || this.address.str_field_1.length<6 ){
      this.presentToast("El Alias / Nombre de la dirección ingresado, no es valido",'danger');
      return;
    }
    if(!this.address.id || this.address.id<1 ){
      this.presentToast("no se pudo actualizar la direccion | reporta este error en la seccion de ayuda|soporte ",'danger');
      this.reloadPage();
      return;
    }
    this.addressService.updateAddress(this.storedObject.id,this.p,this.address,this.address.id).subscribe(
      (response:any) => {
        console.log('updateAddress:',response);
        console.log('updateAddress:',response);
        if(response.result){
          this.dismissModal();
        }
      },
      (error) => {
        alert('Error:'+ error);
      }
    );
  }


  reloadPage() {
    window.location.reload();
  }

  states:state[]=[];
  getStatesByCountryId(){
    this.addressService.getStatesByCountryId(this.storedObject.id,this.p,environment.defaultCountry).subscribe({
      next: (response: any) => {
        console.log('getStatesByCountryId response: ',response.result);
        console.log('getStatesByCountryId response: ',response.result);
        if(response && response.result && response.result.length && response.result.length>0){
          this.states=response.result
        }
      },
      error: (error: any) => {
        alert('Error: ' + error);
      },
      complete: () => {
        console.log('User data retrieval complete.');
      }
    });
  }

}
