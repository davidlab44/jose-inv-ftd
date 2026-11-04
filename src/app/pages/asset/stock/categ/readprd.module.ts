import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReadprdPage } from './readprd';
import { ReadprdPageRoutingModule } from './readprd-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; // ✅ Correcto


import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReadprdPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    ReadprdPage,
  ]
})
export class ReadprdModule {}

