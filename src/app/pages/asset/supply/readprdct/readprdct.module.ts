import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AssetSupplyReadprdctPage } from './readprdct';
import { AssetSupplyReadprdctPageRoutingModule } from './readprdct-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto


import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetSupplyReadprdctPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    AssetSupplyReadprdctPage,
  ]
})
export class AssetSupplyReadprdctModule {}

