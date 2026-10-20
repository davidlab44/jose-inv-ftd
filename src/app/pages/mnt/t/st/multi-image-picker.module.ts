import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MultiImagePickerComponent } from './multi-image-picker.component';

@NgModule({
  declarations: [MultiImagePickerComponent],
  imports: [CommonModule, IonicModule],
  exports: [MultiImagePickerComponent],
})
export class MultiImagePickerModule {}
