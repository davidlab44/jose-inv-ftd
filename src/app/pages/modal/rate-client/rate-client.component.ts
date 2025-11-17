import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, Config, IonList, LoadingController, ModalController, NavController, ToastController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { defaultOpportunity, Opportunity, Price} from '../../../interfaces/opportunity';
import { Router } from '@angular/router';
import { OpportunityService } from '../../../services/opportunity.service';
import { UserData } from '../../../providers/user-data';
import { ConferenceData } from '../../../providers/conference-data';
import { ResUser } from '../../../interfaces/res-user';
import { UserService } from '../../../services/user.service';
import { ImageService } from '../../../services/image.service';
import { ScoreService } from '../../../services/score.service';
import { Calificacion, defaultCalificaion, Review, Score } from '../../../interfaces/score';
import { UtilService } from '../../../services/util.service';
import { MapService } from '../../../services/map.service';
import { ProposalService } from '../../../services/proposal.service';
import { defaultProposal, Proposal } from '../../../interfaces/proposal';

import { Subscription } from 'rxjs';
import { BidService } from '../../../services/bid.service';
import { MqttService } from '../../../services/mqtt.service';

@Component({
  selector: 'app-rate-client',
  templateUrl: './rate-client.component.html',
  styleUrl: './rate-client.component.css'
})
export class RateClientComponent {
  @Input() items: any[];
  @Input() detalles: string;
  lastClickTime: number;
  cooldown: number;
  utilService: any;
  storedObject: any;
  proposalService: any;
  bidService: any;

  constructor(private modalController: ModalController,
    private opportunityService:OpportunityService,
    private userService:UserService,
    private mqttService:MqttService
  ) {}

  stars: number[] = [1, 2, 3, 4, 5];
  currentRating100: number = 0;
  currentRating200: number = 0;
  currentRating300: number = 0;
  userComment: string;

  ngOnInit(): void {
    console.log('red',this.items)
    this.chamba=this.items[0]
    console.log('chamba',this.items[0])
    //console.log('chamba',this.items[0])
    this.setSesion()
  }

  async setSesion() {
    this.p=localStorage.getItem('p');
    this.storedObject = await this.userService.getStoredUserInfo();
    //this.getCmScoreFromWeb(this.storedObject.id)
  }
  cerrar() {
    this.modalController.dismiss();
  }

  rateUser100(rating: number) {
    this.currentRating100 = rating;
  }

  rateUser200(rating: number) {
    this.currentRating200 = rating;
  }

  rateUser300(rating: number) {
    this.currentRating300 = rating;
  }

  enviar() {
    console.log('Enviando calificación...');
    console.log('Puntualidad:', this.currentRating100);
    console.log('Habilidad y experiencia:', this.currentRating200);
    console.log('Velocidad:', this.currentRating300);
    console.log('Comentario:', this.userComment);
    this.cerrar();
    this.onLock()
  }

  chamba: any;
  idCmscoreModelRow:number=0
  p:any;
  onLock() {
    const now = Date.now();
    if (now - this.lastClickTime < this.cooldown) {
      console.log('⚠️ Click bloqueado: debe esperar 5 segundos.');
      return; // ignora el click
    }
    this.lastClickTime = now; // guarda el timestamp del click válido
    this.postularmeAEstaOportunidad();  // llama a tu lógica de real
  }
  //bidsx: any[] = [];
  async postularmeAEstaOportunidad() {
    //this.utilService.presentLoading(this.loadingController,'Enviando propuesta...');
    if (this.validar()) {
      if (this.storedObject.partner_id[0] > 0) {
        console.log('chamba',this.chamba)
        console.log('chamba',this.chamba)
        try {
          const response: any = await this.opportunityService.markAsDone(
              this.storedObject.id,
              this.p,
              this.chamba,
            )
            .toPromise();
            console.log('markAsDone response',response);

            let oportunidadesActivas: any[] = [];

            if(response && response.result){ 
              oportunidadesActivas = this.mqttService.getOportunidadesSnapshot();
              console.log('oportunidadesActivas sin modificar',oportunidadesActivas)
              oportunidadesActivas = this.actualizarBoolField5(oportunidadesActivas,this.chamba.id)
              const nuevoPayload = this.mqttService.forceLocalPayloadUpdate(oportunidadesActivas)
              console.log('oportunidadesActivas modificada',nuevoPayload)
            }else{
              console.error('no se pudo publicar este servicio')
            }


        } catch (error) {
          console.error('Error al postularme a la oportunidad:', error);
          //this.presentToast('Ocurrió un error al enviar la propuesta.');
        } finally { }
      } else {
        this.utilService.presentToast('No hay partner seleccionado');
      }
    }
    //this.utilService.dismissLoading();
    this.dismissModal();
  }

  actualizarBoolField5(lista: any[], id: number): any[] {
    // Buscar el índice del elemento
    const index = lista.findIndex(item => item.id === id);
    // Si existe, modificarlo
    if (index !== -1) {
      lista[index].bool_field_5 = true;
    } else {
      console.warn(`Elemento con id ${id} no encontrado`);
    }
    return lista; // Devuelve la lista (modificada)
  }

  validar():boolean {
    // console.log('calificacion',this.myCalificacion)
    // this.proposal.str_field_5=this.selectedHour;
    // if(this.proposal.str_field_13.length<3){this.presentToast("Precio ofertado no es valido","danger"); return false;}
    // if(this.proposal.str_field_5.length<3){this.presentToast("Hora seleccionada no es valido","danger"); return false;}
    return true;
  }

  dismissModal() { 
    this.modalController.dismiss({
      closedBy: 'customCloseModalCalificarCleinte',
      extraData: { foo: 'barCalificarCliente' }
    }); 
    // this.modalController.dismiss().then(() => {
    //   this.navController.navigateRoot('/app/tabs/schedule');
    // });
  }
  
}
