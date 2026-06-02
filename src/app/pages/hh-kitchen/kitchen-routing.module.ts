import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { KitchenPage } from './kitchen';

const routes: Routes = [
  {
    path: '',
    component: KitchenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KitchenPageRoutingModule { }
