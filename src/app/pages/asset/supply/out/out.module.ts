import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AssetSupplyOutPage } from './out';
import { AssetSupplyOutPageRoutingModule } from './out-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetSupplyOutPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    ReactiveFormsModule,

  ],
  declarations: [
    AssetSupplyOutPage
  ]
})
export class AssetSupplyOutModule {}

