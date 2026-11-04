import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PricePage } from './price';
import { PricePageRoutingModule } from './price-routing.module';
import { SharedModule } from '../../../shared/shared.module'; // ✅ Correcto
import { FullCalendarModule } from '@fullcalendar/angular';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PricePageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    FullCalendarModule
  ],
  declarations: [
    PricePage,
  ]
})
export class PriceModule {}

