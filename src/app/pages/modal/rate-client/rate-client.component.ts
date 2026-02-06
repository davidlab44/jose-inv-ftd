import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rate-client',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './rate-client.component.html',
  styleUrls: ['./rate-client.component.css']
})
export class RateClientComponent {

  @Input() items: any;
  @Input() detalles: string;

  zoomActive = false;

  constructor(private modalController: ModalController) {}

  cerrar() {
    this.modalController.dismiss();
  }

  openZoom() {
    this.zoomActive = true;
  }

  closeZoom() {
    this.zoomActive = false;
  }
}

