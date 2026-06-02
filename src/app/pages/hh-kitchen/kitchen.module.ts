import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { KitchenPage } from './kitchen';
import { KitchenPageRoutingModule } from './kitchen-routing.module';
//import { CapitalizePipe } from '../../pipes/capitalize.pipe';

import { PipesModule } from '../../pipes/pipes.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KitchenPageRoutingModule,
    PipesModule
  ],
  declarations: [
    KitchenPage,
//    CapitalizePipe
  ]
})
export class KitchenModule { }



















/*import { NgModule } from '@angular/core';*/
/*import { CommonModule } from '@angular/common';*/
/*import { FormsModule } from '@angular/forms';*/
/*import { IonicModule } from '@ionic/angular';*/

/*import { KitchenPage } from './kitchen';*/
/*//import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';*/
/*import { KitchenPageRoutingModule } from './kitchen-routing.module';*/
/*import { CapitalizePipe } from '../../pipes/capitalize.pipe';*/

/*@NgModule({*/
    /*imports: [*/
        /*CommonModule,*/
        /*FormsModule,*/
        /*IonicModule,*/
        /*KitchenPageRoutingModule*/
    /*],*/
    /*declarations: [*/
        /*KitchenPage,*/
        /*CapitalizePipe*/
    /*]*/
/*})*/
/*export class KitchenModule { }*/
