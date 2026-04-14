import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AllocPage } from './alloc';

const routes: Routes = [
  {
    path: '',
    component: AllocPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllocPageRoutingModule { }
