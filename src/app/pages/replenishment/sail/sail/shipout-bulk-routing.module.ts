import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShipoutBulkPage } from './shipout-bulk';

const routes: Routes = [
  {
    path: '',
    component: ShipoutBulkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipoutBulkPageRoutingModule { }
