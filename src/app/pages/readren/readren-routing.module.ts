import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReadrenPage } from './readren';

const routes: Routes = [
  {
    path: '',
    component: ReadrenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReadrenPageRoutingModule { }
