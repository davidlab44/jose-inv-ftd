import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PurchasePage } from '../purchase/purchase';
import { PurchasePageRoutingModule } from './purchase-routing.module';
import { SharedModule } from '../../../shared/shared.module';


import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchasePageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    PurchasePage,
  ]
})
export class ProdrexModule {}

