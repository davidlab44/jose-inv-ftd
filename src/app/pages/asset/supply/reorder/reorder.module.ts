import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AssetSupplyReorderPage } from './reorder';
import { AssetSupplyReorderPageRoutingModule } from './reorder-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto


import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetSupplyReorderPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    AssetSupplyReorderPage,
  ]
})
export class AssetSupplyReorderModule {}

