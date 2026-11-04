import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PricePage } from './price';

const routes: Routes = [
  {
    path: '',
    component: PricePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricePageRoutingModule { }
