import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TankPage } from './tank';

const routes: Routes = [{ path: '', component: TankPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankPageRoutingModule {}
