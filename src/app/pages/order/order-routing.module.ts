import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrderPage } from './order';

const routes: Routes = [
  {
    path: '',
    component: OrderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderPageRoutingModule { }
