import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReadprdPage } from './readprd';

const routes: Routes = [
  {
    path: '',
    component: ReadprdPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReadprdPageRoutingModule { }
