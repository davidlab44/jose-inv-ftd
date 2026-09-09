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
  /*        {*/
            /*path: 'session/:sessionId',*/
            /*loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)*/
          /*}*/
        ]
      },
/*      {*/
        /*path: 'speakers',*/
        /*children: [*/
          /*{*/
            /*path: '',*/
            /*loadChildren: () => import('../speaker-list/speaker-list.module').then(m => m.SpeakerListModule)*/
          /*},*/
          /*{*/
            /*path: 'session/:sessionId',*/
            /*loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailModule)*/
          /*},*/
          /*{*/
            /*path: 'speaker-details/:speakerId',*/
            /*loadChildren: () => import('../speaker-detail/speaker-detail.module').then(m => m.SpeakerDetailModule)*/
          /*}*/
        /*]*/
      /*},*/
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () => import('../map/map.module').then(m => m.MapModule)
          }
        ]
      },
      /*      {*/
        /*path: 'about',*/
        /*children: [*/
          /*{*/
            /*path: '',*/
            /*loadChildren: () => import('../about/about.module').then(m => m.AboutModule)*/
          /*}*/
        /*]*/
      /*},*/
/*      {*/
        /*path: 'order',*/
        /*children: [*/
          /*{*/
            /*path: '',*/
            /*loadChildren: () => import('../order/order.module').then(m => m.OrderModule)*/
          /*}*/
        /*]*/
      /*},*/
      {
        path: 'scnbrcd',
        children: [
          {
            path: '',
            loadChildren: () => import('../scnbrcd/scnbrcd.module').then(m => m.ScnbrcdModule)
          }
        ]
      },
/*      {*/
        /*path: 'kitchen',*/
        /*children: [*/
          /*{*/
            /*path: '',*/
            /*loadChildren: () => import('../kitchen/kitchen.module').then(m => m.KitchenModule)*/
          /*}*/
        /*]*/
      /*},*/
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
        path: 'glpprices',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/price/price.module').then(m => m.PriceModule)
          }
        ]
      },     
      {
        path: 'replenishment-allocated',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/alloc/alloc.module').then(m => m.AllocModule)
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
        path: 'ats-blg-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../ats/blg/getall/getall.module').then(m =>m.GetallModule )
          }
        ]
      },
      {
        path: 'ats-blg-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../ats/blg/post/post.module').then(m =>m.AssetSupplyPostModule )
          }
        ]
      },
      {
        path: 'ats-ats-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../ats/ats/post/post.module').then(m =>m.AssetSupplyPostModule )
          }
        ]
      },
      {
        path: 'ats-src-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../ats/src/getall/getall.module').then(m =>m.GetallModule )
          }
        ]   
      },
      {
        path: 'ats-src-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../ats/src/post/post.module').then(m =>m.AssetSupplyPostModule )
          }
        ]
      },
      {
        path: 'ats-bom-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../ats/bom/post/post.module').then(m =>m.AssetSupplyPostModule )
          }
        ]
      },
      {
        path: 'asset-stock-categ',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/stock/categ/readprd.module').then(m =>m.ReadprdModule )
          }
        ]
      },
      {
        path: 'asset-stock-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../asset/stock/post/post.module').then(m => m.AssetSupplyPostModule)
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
        path: 'replenishment-withdrawn-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/withdrawn/getall/getall.module').then(m => m.GetallModule)
          }
        ]
      },
     {
        path: 'replenishment-twin-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/twin/getall/getall.module').then(m => m.GetallModule)
          }
        ]
      },
      {
        path: 'replenishment-vendor-patch',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/vendor/patch/patch.module').then(m => m.PatchModule)
          }
        ]
      },
      {
        path: 'replenishment-scale-patch',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/scale/patch/patch.module').then(m => m.PatchModule)
          }
        ]
      },
      {
        path: 'replenishment-in-patch',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/in/patch/patch.module').then(m => m.PatchModule)
          }
        ]
      },
      {
        path: 'replenishment-in-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/in/post/post.module').then(m => m.PostModule)
          }
        ]
      },
      {
        path: 'replenishment-out-patch',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/out/patch/patch.module').then(m => m.PatchModule)
          }
        ]
      },
      {
        path: 'replenishment-get-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../replenishment/get/getall/getall.module').then(m => m.GetallModule)
          }
        ]
      },

      {
        path: 'prch-in-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../prch/in/post/post.module').then(m => m.AssetSupplyPostModule)
          }
        ]
      },


      {
        path: 'cert-main-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../cert/main/getall/getall.module').then(m => m.GetallModule)
          }
        ]
      },

      {
        path: 'cert-main-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../cert/main/post/post.module').then(m => m.AssetSupplyPostModule)
          }
        ]
      },

      {
        path: 'prch-main-getall',
        children: [
          {
            path: '',
            loadChildren: () => import('../prch/main/getall/getall.module').then(m => m.GetallModule)
          }
        ]
      },

      {
        path: 'prch-main-post',
        children: [
          {
            path: '',
            loadChildren: () => import('../prch/main/post/post.module').then(m => m.AssetSupplyPostModule)
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

