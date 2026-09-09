import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReadprdctPage } from './readprdct';

const routes: Routes = [
  {
    path: '',
    component: ReadprdctPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReadprdctPageRoutingModule { }
