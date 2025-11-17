import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs-page';
import { SchedulePage } from '../schedule/schedule';
import { ScnbrcdPage } from '../scnbrcd/scnbrcd';


const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'schedule',
        children: [
          {
            path: '',
            component: SchedulePage,
          },
          {
            path: 'session/:sessionId',
            loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)
          }
        ]
      },
      {
        path: 'speakers',
        children: [
          {
            path: '',
            loadChildren: () => import('../speaker-list/speaker-list.module').then(m => m.SpeakerListModule)
          },
          {
            path: 'session/:sessionId',
            loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)
          },
          {
            path: 'speaker-details/:speakerId',
            loadChildren: () => import('../speaker-detail/speaker-detail.module').then(m => m.SpeakerDetailModule)
          }
        ]
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () => import('../map/map.module').then(m => m.MapModule)
          }
        ]
      },
      {
        path: 'about',
        children: [
          {
            path: '',
            loadChildren: () => import('../about/about.module').then(m => m.AboutModule)
          }
        ]
      },
      {
        path: 'order',
        children: [
          {
            path: '',
            loadChildren: () => import('../order/order.module').then(m => m.OrderModule)
          }
        ]
      },
      {
        path: 'scnbrcd',
        children: [
          {
            path: '',
            loadChildren: () => import('../scnbrcd/scnbrcd.module').then(m => m.ScnbrcdModule)
          }
        ]
      },
      {
        path: 'kitchen',
        children: [
          {
            path: '',
            loadChildren: () => import('../kitchen/kitchen.module').then(m => m.KitchenModule)
          }
        ]
      },     {
        path: 'readprdct',
        children: [
          {
            path: '',
            loadChildren: () => import('../readprdct/readprdct.module').then(m => m.ReadprdctModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/app/tabs/schedule',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }

