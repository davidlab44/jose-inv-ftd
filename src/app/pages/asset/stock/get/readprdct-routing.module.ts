import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssetSupplyReadprdctPage } from './readprdct';

const routes: Routes = [
  {
    path: '',
    component: AssetSupplyReadprdctPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetSupplyReadprdctPageRoutingModule { }
