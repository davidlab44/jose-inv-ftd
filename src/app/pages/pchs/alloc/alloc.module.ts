import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AllocPage } from './alloc';
import { AllocPageRoutingModule } from './alloc-routing.module';
import { SharedModule } from '../../../shared/shared.module'; // ✅ Correcto
import { FullCalendarModule } from '@fullcalendar/angular';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AllocPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    FullCalendarModule
  ],
  declarations: [
    AllocPage,
  ]
})
export class AllocModule {}

