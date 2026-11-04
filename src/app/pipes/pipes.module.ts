import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizePipe } from './capitalize.pipe';
import { DatelatamPipe } from './datelatam.pipe';

@NgModule({
  declarations: [CapitalizePipe,DatelatamPipe],
  exports: [CapitalizePipe,DatelatamPipe],
  imports: [CommonModule]
})
export class PipesModule {}

