import { Component, ElementRef, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { Platform, ViewDidEnter, ViewWillLeave } from '@ionic/angular';
import { DOCUMENT} from '@angular/common';

import { darkStyle } from './map-dark-style';
import { SaleOrderService } from '../../services/sale-order.service';
import { Router } from '@angular/router';
import { AlertController, IonList, IonRouterOutlet, LoadingController, ModalController, ToastController, Config } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  styleUrls: ['./map.scss']
})
export class MapPage{
  @ViewChild('mapCanvas', { static: true }) mapElement: ElementRef;

    
  constructor(){}

    ngOnInit() {}

    closeApp() {
      localStorage.clear();
      sessionStorage.clear();
      window.close();
      window.location.href = "about:blank"; 
    }


}

