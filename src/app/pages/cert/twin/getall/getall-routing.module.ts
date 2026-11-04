import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GetallPage } from './getall';

const routes: Routes = [
  {
    path: '',
    component: GetallPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GetallPageRoutingModule { }
