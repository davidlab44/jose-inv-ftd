import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PatchPage } from './patch';
import { PatchPageRoutingModule } from './patch-routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PatchPageRoutingModule,
    SharedModule,
    PipesModule,
    ReactiveFormsModule,

  ],
  declarations: [
    PatchPage
  ]
})
export class PatchModule {}

