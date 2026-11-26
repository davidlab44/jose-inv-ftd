import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GetPage } from './get';

const routes: Routes = [
  {
    path: '',
    component: GetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GetPageRoutingModule { }
