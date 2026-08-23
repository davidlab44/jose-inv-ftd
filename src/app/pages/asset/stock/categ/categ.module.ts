import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CategPage } from './categ';
import { CategPageRoutingModule } from './categ-routing.module';
import { SharedModule } from '../../../../shared/shared.module'; 
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';



import { PipesModule } from '../../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    ReactiveFormsModule 
  ],
  declarations: [
    CategPage,
  ]
})
export class CategModule {}

