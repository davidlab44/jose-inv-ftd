import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ScnbrcdPage } from './scnbrcd';
import { ScnbrcdPageRoutingModule } from './scnbrcd-routing.module';
import { SharedModule } from '../../shared/shared.module'; // ✅ Correcto


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ScnbrcdPageRoutingModule,
    SharedModule // ✅ Aquí es donde entra el componente
  ],
  declarations: [
    ScnbrcdPage
  ]
})
export class ScnbrcdModule {}

