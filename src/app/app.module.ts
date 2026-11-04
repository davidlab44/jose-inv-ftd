import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { ApplyComponent } from '../app/pages/modal/apply/apply.component';

/*** 👇 IMPORTS NECESARIOS PARA EL LOCALE COLOMBIANO ***/
import localeEsCO from '@angular/common/locales/es-CO';
import { registerLocaleData } from '@angular/common';

/*** 👇 REGISTRAR LOCALE ANTES DE @NgModule ***/
registerLocaleData(localeEsCO, 'es-CO');
import { NtwkInterceptor } from '../app/intc/ntwk.interceptor';


@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })
  ],
  declarations: [AppComponent, ApplyComponent],
  providers: [
    InAppBrowser,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NtwkInterceptor,
      multi: true
    }
  ],


  //providers: [InAppBrowser],
  bootstrap: [AppComponent]
})
export class AppModule {}





/*import { HttpClientModule } from '@angular/common/http';*/
/*import { NgModule } from '@angular/core';*/
/*import { BrowserModule } from '@angular/platform-browser';*/
/*import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';*/
/*import { IonicModule } from '@ionic/angular';*/
/*import { IonicStorageModule } from '@ionic/storage-angular';*/
/*import { AppRoutingModule } from './app-routing.module';*/
/*import { AppComponent } from './app.component';*/
/*import { ServiceWorkerModule } from '@angular/service-worker';*/
/*import { environment } from '../environments/environment';*/
/*import { FormsModule } from '@angular/forms';*/
/*import { ApplyComponent} from '../app/pages/modal/apply/apply.component';*/

/*@NgModule({*/
  /*imports: [*/
    /*BrowserModule,*/
    /*AppRoutingModule,*/
    /*HttpClientModule,*/
    /*FormsModule,*/
    /*IonicModule.forRoot(),*/
    /*IonicStorageModule.forRoot(),*/
    /*ServiceWorkerModule.register('ngsw-worker.js', {*/
      /*enabled: environment.production*/
    /*})*/
  /*],*/
  /*declarations: [AppComponent,ApplyComponent],*/
  /*providers: [InAppBrowser],*/
  /*bootstrap: [AppComponent]*/
/*})*/
/*export class AppModule {}*/
