import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReplenishmentPage } from './replenishment';

const routes: Routes = [
  {
    path: '',
    component: ReplenishmentPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReplenishmentPageRoutingModule { }
