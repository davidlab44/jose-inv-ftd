import { NgModule,CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReplenishmentPage } from './replenishment';
import { ReplenishmentPageRoutingModule } from './replenishment-routing.module';
import { SharedModule } from '../../../shared/shared.module';
import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReplenishmentPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule
  ],
  declarations: [
    ReplenishmentPage,
  ]
})
export class ReplenishmentModule {}

