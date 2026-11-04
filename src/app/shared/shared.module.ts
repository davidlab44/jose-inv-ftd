import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // ✅ agrega esto

import { BarcodeGeneratorComponent } from '../pages/barcode-generator/barcode-generator.component';
import { SignatureComponent } from '../components/signature/signature.component';

@NgModule({
  declarations: [BarcodeGeneratorComponent,SignatureComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule // ✅ necesario para [(ngModel)]
  ],
  exports: [BarcodeGeneratorComponent,SignatureComponent]
})
export class SharedModule {}



