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
      },
      {
        path: 'readprd',
        children: [
          {
            path: '',
            loadChildren: () => import('../readprd/readprd.module').then(m => m.ReadprdModule)
          }
        ]
      },
      {
        path: 'readprdct',
        children: [
          {
            path: '',
            loadChildren: () => import('../readprdct/readprdct.module').then(m => m.ReadprdctModule)
          }
        ]
      },
      {
        path: 'readren',
        children: [
          {
            path: '',
            loadChildren: () => import('../readren/readren.module').then(m => m.ReadrenModule)
          }
        ]
      },
      {
        path: 'prodrex',
        children: [
          {
            path: '',
            loadChildren: () => import('../prodrex/prodrex.module').then(m => m.ProdrexModule)
          }
        ]
      },
      {
        path: 'replenishment',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/replenishment/replenishment.module').then(m => m.ReplenishmentModule)
          }
        ]
      },
      {
        path: 'glpprices',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/price/price.module').then(m => m.PriceModule)
          }
        ]
      },
      {
        path: 'replenishment-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/post/post.module').then(m => m.PostModule)
          }
        ]
      },
      {
        path: 'replenishment-patch',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/patch/patch.module').then(m => m.PatchModule)
          }
        ]
      },
      {
        path: 'asset-supply-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/supply/post/post.module').then(m => m.AssetSupplyPostModule)
          }
        ]
      },
      {
        path: 'asset-supply-patch',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/supply/patch/patch.module').then(m => m.AssetSupplyPatchModule)
          }
        ]
      },
      {
        path: 'asset-supply-out',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/supply/out/out.module').then(m => m.AssetSupplyOutModule)
          }
        ]
      },
      { 
        path: 'asset-supply-readprdct',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/supply/readprdct/readprdct.module').then(m => m.AssetSupplyReadprdctModule)
          }
        ]
      },
      { 
        path: 'asset-supply-reorder',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/supply/reorder/reorder.module').then(m => m.AssetSupplyReorderModule)
          }
        ]
      },
      {
        path: 'replenishment-withdrawn-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/withdrawn/post/post.module').then(m => m.PostModule)
          }
        ]
      },
      {
        path: 'replenishment-withdrawn-postaut',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/withdrawn/postaut/post.module').then(m => m.PostModule)
          }
        ]
      },
      {
        path: 'replenishment-withdrawn-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/withdrawn/getall/getall.module').then(m => m.GetallModule)
          }
        ]
      },
      {
        path: 'logistic-logistic-getall-in',
        children: [
          {
            path: '',
            loadChildren: () => import('../logistic/logistic/getallin/getall.module').then(m => m.GetallModule)
          }
        ]
      },
      {
        path: 'logistic-logistic-getall-out',
        children: [
          {
            path: '',
            loadChildren: () => import('../logistic/logistic/getallout/getall.module').then(m => m.GetallModule)
          }
        ]
      },
     
      {
        path: 'replenishment-ai-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/ai/post/post.module').then(m => m.PostModule)
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

