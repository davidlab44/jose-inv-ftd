import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TankPageRoutingModule } from './tank-routing.module';
import { TankPage } from './tank';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TankPageRoutingModule],
  declarations: [TankPage]
})
export class TankPageModule {}
