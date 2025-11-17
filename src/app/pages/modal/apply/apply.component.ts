import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, Config, IonList, LoadingController, ModalController, NavController, ToastController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { UserData } from '../../../providers/user-data';
import { ConferenceData } from '../../../providers/conference-data';
import { ResUser } from '../../../interfaces/res-user';
import { UserService } from '../../../services/user.service';
import { UtilService } from '../../../services/util.service';

@Component({
  selector: 'app-apply',
  templateUrl: './apply.component.html',
  styleUrl: './apply.component.css'
})
export class ApplyComponent implements OnInit,ViewWillEnter,ViewDidEnter {
  @Input() items: any[]; // The list of items to display
  @Input() detalles: any[]; // The list of items to display
  chamba: any;
  publishVisibility=true;
  ios: boolean;
  
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
    private navController: NavController,
  ){}

  ngOnInit(): void {    //console.log('red',this.items)
    this.chamba=this.items[0]    //console.log('chamba',this.items[0])
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

}
