import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProdrexPage } from './prodrex';
import { ProdrexPageRoutingModule } from './prodrex-routing.module';
import { SharedModule } from '../../shared/shared.module'; // ✅ Correcto


import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProdrexPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    ProdrexPage,
  ]
})
export class ProdrexModule {}

