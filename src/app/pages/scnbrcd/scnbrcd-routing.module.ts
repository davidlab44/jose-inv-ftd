import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ScnbrcdPage } from './scnbrcd';

const routes: Routes = [
  {
    path: '',
    component: ScnbrcdPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScnbrcdPageRoutingModule { }
