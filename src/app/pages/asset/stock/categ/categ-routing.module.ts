import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CategPage } from './categ';

const routes: Routes = [
  {
    path: '',
    component: CategPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategPageRoutingModule { }
