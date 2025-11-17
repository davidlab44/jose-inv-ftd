import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // ✅ agrega esto

import { BarcodeGeneratorComponent } from '../pages/barcode-generator/barcode-generator.component';

@NgModule({
  declarations: [BarcodeGeneratorComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule // ✅ necesario para [(ngModel)]
  ],
  exports: [BarcodeGeneratorComponent]
})
export class SharedModule {}



