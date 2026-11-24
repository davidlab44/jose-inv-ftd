import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AssetSupplyPostPage } from './post';
import { AssetSupplyPostPageRoutingModule } from './post-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssetSupplyPostPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AssetSupplyPostPage,
  ]
})
export class AssetSupplyPostModule {}

