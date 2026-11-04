import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatchPage } from './patch';

const routes: Routes = [
  {
    path: '',
    component: PatchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatchPageRoutingModule { }
