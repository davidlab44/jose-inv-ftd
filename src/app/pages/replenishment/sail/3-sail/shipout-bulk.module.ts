import { NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShipoutBulkPage } from './shipout-bulk';
import { ShipoutBulkPageRoutingModule } from './shipout-bulk-routing.module';
import { SharedModule } from '../../../../shared/shared.module';
import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShipoutBulkPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    ShipoutBulkPage,
  ]
})
export class ShipoutBulkModule {}

