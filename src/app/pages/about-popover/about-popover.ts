import { Component } from '@angular/core';

import { PopoverController } from '@ionic/angular';

@Component({
  template: `
    <ion-list>
      <ion-item button (click)="close('#')">
        <ion-label>Violeta app</ion-label>
      </ion-item>
      <ion-item button (click)="close('https://acdesarrollo.org/')">
        <ion-label>ACD consultores</ion-label>
      </ion-item>
      <ion-item button (click)="close('https://acdesarrollo.org/nuestros-proyectos/')">
        <ion-label>Otros proyectos</ion-label>
      </ion-item>
      <ion-item button (click)="close('https://acdesarrollo.org/noticias/')">
        <ion-label>Noticias</ion-label>
      </ion-item>
      <ion-item button (click)="support()">
        <ion-label>Soporte</ion-label>
      </ion-item>
    </ion-list>
  `
})
export class PopoverPage {
  constructor(public popoverCtrl: PopoverController) {}

  support() {
    // this.app.getRootNavs()[0].push('/support');
    this.popoverCtrl.dismiss();
  }

  close(url: string) {
    window.open(url, '_blank');
    this.popoverCtrl.dismiss();
  }
}
