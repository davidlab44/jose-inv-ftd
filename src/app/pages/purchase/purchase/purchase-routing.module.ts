import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PurchasePage } from './purchase';

const routes: Routes = [
  {
    path: '',
    component: PurchasePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchasePageRoutingModule { }
