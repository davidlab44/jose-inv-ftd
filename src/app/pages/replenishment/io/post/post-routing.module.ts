import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AssetSupplyPostPage } from './post';

const routes: Routes = [
  {
    path: '',
    component: AssetSupplyPostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetSupplyPostPageRoutingModule { }

