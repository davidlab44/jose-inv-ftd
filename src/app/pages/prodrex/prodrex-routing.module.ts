import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProdrexPage } from './prodrex';

const routes: Routes = [
  {
    path: '',
    component: ProdrexPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProdrexPageRoutingModule { }
