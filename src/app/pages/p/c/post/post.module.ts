import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ImgselModule } from '../../../../components/imgsel/imgsel.module';
import { AssetSupplyPostPage, PostUsersModal } from './post';
import { AssetSupplyPostPageRoutingModule } from './post-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    ImgselModule,
    FormsModule,
    IonicModule,
    AssetSupplyPostPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AssetSupplyPostPage,
    PostUsersModal,
  ]
})
export class AssetSupplyPostModule {}

