import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AssetSupplyPatchPage } from './patch';
import { AssetSupplyPatchPageRoutingModule } from './patch-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetSupplyPatchPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    ReactiveFormsModule,

  ],
  declarations: [
    AssetSupplyPatchPage
  ]
})
export class AssetSupplyPatchModule {}

