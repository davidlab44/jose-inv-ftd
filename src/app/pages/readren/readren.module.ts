import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReadrenPage } from './readren';
import { ReadrenPageRoutingModule } from './readren-routing.module';
import { SharedModule } from '../../shared/shared.module'; // ✅ Correcto


import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReadrenPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    ReadrenPage,
  ]
})
export class ReadrenModule {}

