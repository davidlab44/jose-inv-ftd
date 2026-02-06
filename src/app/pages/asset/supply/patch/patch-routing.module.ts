import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssetSupplyPatchPage } from './patch';

const routes: Routes = [
  {
    path: '',
    component: AssetSupplyPatchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetSupplyPatchPageRoutingModule { }
