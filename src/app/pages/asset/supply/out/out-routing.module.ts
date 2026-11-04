import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetSupplyOutPage } from './out';

const routes: Routes = [
  {
    path: '',
    component: AssetSupplyOutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetSupplyOutPageRoutingModule { }
