import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SchedulePage } from './schedule';
import { SchedulePageRoutingModule } from './schedule-routing.module';
import { SharedModule } from '../../shared/shared.module'; // ✅ Correcto

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedulePageRoutingModule,
    SharedModule // ✅ Aquí es donde entra el componente
  ],
  declarations: [
    SchedulePage
  ]
})
export class ScheduleModule {}

