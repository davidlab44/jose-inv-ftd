import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssetSupplyReorderPage } from './reorder';

const routes: Routes = [
  {
    path: '',
    component: AssetSupplyReorderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetSupplyReorderPageRoutingModule { }
