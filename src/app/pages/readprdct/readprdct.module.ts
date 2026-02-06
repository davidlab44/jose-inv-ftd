import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReadprdctPage } from './readprdct';
import { ReadprdctPageRoutingModule } from './readprdct-routing.module';
import { SharedModule } from '../../shared/shared.module'; // ✅ Correcto


import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReadprdctPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    ReadprdctPage,
  ]
})
export class ReadprdctModule {}

