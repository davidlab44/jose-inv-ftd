import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SwUpdate } from '@angular/service-worker';
import { MenuController, Platform, ToastController } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Storage } from '@ionic/storage-angular';
import { UserData } from './providers/user-data';
import { OpportunityService } from './services/opportunity.service';
import { environment } from '../environments/environment';
import { Category } from './interfaces/category';
import { UserService } from './services/user.service';
import { NetworkService } from '../app/services/local/network.service';
import { skip } from 'rxjs/operators';
import {UtilService } from '../app/services/util.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  showSplitPane = true;
  categories: Category[] = [];
  
  appPages = [
     {
       title: 'Inicio',
       url: '/app/tabs/schedule',
       icon: 'calendar'
     },
     {
       title: 'Productos',
       url: '/app/tabs/readprdct',
       icon: 'construct'
     },
     {
       title: 'Entrada',
       url: '/app/tabs/kitchen',
       icon: 'arrow-down'
     },
     {
       title: 'Ingresos de mercancia',
       url: '/app/tabs/readren',
       icon: 'chevron-forward-circle'
     },
     {
       title: 'Listar productos ',
       url: '/app/tabs/asset-supply-readprdct',
       icon: 'document-text'
     },
     {
       title: 'Registrar producto',
       url: '/app/tabs/asset-supply-post',
       icon: 'add-circle'
     },
     {
       title: 'Kilos retirados',
       url: '/app/tabs/replenishment-withdrawn-getall',
       icon: 'checkbox'
     },
     {
       title: 'Registrar retiro',
       url: '/app/tabs/replenishment-withdrawn-post',
       icon: 'add-circle'
     },
   ];
   appPages2 = [
     {
       title: 'Inicio',
       url: '/app/tabs/schedule',
       icon: 'calendar'
     },
      {
       title: 'Productos',
       url: '/app/tabs/readprd',
       icon: 'construct'
     },
   ];

   appPages3 = [
     {
       title: 'Inicio',
       url: '/app/tabs/schedule',
       icon: 'calendar'
     },
      {
       title: 'Productos',
       url: '/app/tabs/readprd',
       icon: 'construct'
     },
     {
       title: 'Reabastecimiento',
       url: '/app/tabs/asset-supply-reorder',
       icon: 'layers'
     },
   ];
    
   appPages7 = [
     {
       title: 'Inicio',
       url: '/app/tabs/schedule',
       icon: 'calendar'
     },
     {
       title: 'Productos',   
       url: '/app/tabs/readprd',       
       icon: 'construct'
     },
     {
       title: 'Reabastecimiento',
       url: '/app/tabs/asset-supply-reorder',
       icon: 'layers'
     },
     {
       title: 'Entrada',
       url: '/app/tabs/kitchen',
       icon: 'arrow-down'
     },
     {
       title: 'Ingresos de mercancia',
       url: '/app/tabs/readren',
       icon: 'chevron-forward-circle'
     },
     {
       title: 'Listar productos ',
       url: '/app/tabs/asset-supply-readprdct',
       icon: 'document-text'
     },
     {
       title: 'Certificados',
       url: '/app/tabs/cert-main-getall',
       icon: 'ribbon'
     },
     {
       title: 'Compras',
       url: '/app/tabs/pchs-withdrawn-getall',
       icon: 'document-text'
     },
     {
       title: 'Glp precios',
       url: '/app/tabs/glpprices',
       icon: 'cash'
     },
     {
       title: 'Bolsas | Cupo | Quota',
       url: '/app/tabs/replenishment-allocated',
       icon: 'pie-chart'
     },
     {
       title: 'Registrar producto',
       url: '/app/tabs/asset-supply-post',
       icon: 'add-circle'
     },
     {
       title: 'Registrar retiro',
       url: '/app/tabs/replenishment-withdrawn-post',
       icon: 'swap-horizontal'
     },
     {
       title: 'Plexa',
       url: '/app/tabs/replenishment-withdrawn-getall',
       icon: 'git-commit'
     },
     {
       title: 'Kilos retirados',
       url: '/app/tabs/replenishment-get-getall',
       icon: 'scale'
     },
   ];

   //enevis
   appPages8 = [
     {
       title: 'Plexa',
       url: '/app/tabs/replenishment-withdrawn-getall',
       icon: 'scale'
     },
   ];

 appPages9 = [
   {
     title: 'Tareas activas',
     url: '/app/tabs/ats-blg-getall',
     icon: 'document-text'
   },
   {
     title: 'Asignar tarea',
     url: '/app/tabs/ats-blg-post',
     icon: 'add'
   },
   {
     title: 'Listado tareas',
     url: '/app/tabs/ats-ats-getall',
     icon: 'Document-text'
   },
   {
     title: 'Crear tarea',
     url: '/app/tabs/ats-ats-post',
     icon: 'add'
   },
   {
     title: 'Listado sub tareas',
     url: '/app/tabs/ats-src-getall',
     icon: 'Document-text'
   },
   {
     title: 'Crear sub tarea',
     url: '/app/tabs/ats-src-post',
     icon: 'add'
   },
   {
     title: 'Isotanque',
     url: '/app/tabs/tank-tank-post',
     icon: 'information'
   },
   {
     title: 'Consultar ingreso a patio',
     url: '/app/tabs/sgc-in-getall',
     icon: 'barcode'
   },
   {
     title: 'Registrar ingreso a patio',
     url: '/app/tabs/sgc-in-post',
     icon: 'barcode'
   },
    {
     title: 'Etapas',
     url: '/app/tabs/mnt-stg-getall',
     icon: 'albums'
   },
   {
     title: 'Agregar etapa',
     url: '/app/tabs/mnt-stg-post',
     icon: 'today'
   },
   {
     title: 'Mantenimientos',
     url: '/app/tabs/mnt-mnt-getall',
     icon: 'build'
   },
   {
     title: 'Aprobar/rechazr trabajo SGC',
     url: '/app/tabs/mnt-mnt-post',
     icon: 'ban'
   },
   {
     title: 'Almacen',
     url: '/app/tabs/schedule',
     icon: 'calendar'
   },
   {
     title: 'Productos',   
     url: '/app/tabs/readprd',       
     icon: 'construct'
   },
   {
     title: 'Reabastecimiento',
     url: '/app/tabs/asset-supply-reorder',
     icon: 'layers'
   },
   {
     title: 'Entrada',
     url: '/app/tabs/kitchen',
     icon: 'arrow-down'
   },
   {
     title: 'Ingresos de mercancia',
     url: '/app/tabs/readren',
     icon: 'chevron-forward-circle'
   },
   {
     title: 'Listar productos ',
     url: '/app/tabs/asset-supply-readprdct',
     icon: 'document-text'
   },
   {
     title: 'Certificados',
     url: '/app/tabs/cert-main-getall',
     icon: 'ribbon'
   },
   {
     title: 'Compras',
     url: '/app/tabs/prch-main-getall',
     icon: 'document-text'
   },
   {
     title: 'Glp precios',
     url: '/app/tabs/glpprices',
     icon: 'cash'
   },
   {
     title: 'Bolsas | Cupo | Quota',
     url: '/app/tabs/replenishment-allocated',
     icon: 'pie-chart'
   },
   {
     title: 'Nuevo producto by categ',
     url: '/app/tabs/asset-stock-categ',
     icon: 'add-circle'
   },
   {
     title: 'Nuevo producto',
     url: '/app/tabs/asset-stock-post',
     icon: 'add-circle'
   },
   {
     title: 'Manual prdct register',
     url: '/app/tabs/asset-supply-post',
     icon: 'add-circle'
   },
   {
     title: 'Registrar retiro',
     url: '/app/tabs/replenishment-withdrawn-post',
     icon: 'swap-horizontal'
   },
   {
     title: 'Plexa',
     url: '/app/tabs/replenishment-withdrawn-getall',
     icon: 'git-commit'
   },
   {
     title: 'Kilos retirados',
     url: '/app/tabs/replenishment-get-getall',
     icon: 'scale'
   },
 ];

  loggedIn = false;
  dark = false;
  public showMenu = true; 
  posCategories: any[] = [];
  storedObject:any;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private storage: Storage,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private opportunityService:OpportunityService,
    //private updates: SwUpdate,
    private userService:UserService,
    private network: NetworkService,
    private utilService: UtilService
  ) {
    this.checkForUpdates();
    console.log("constructor")
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
 
    console.log("event url",event.url);
    console.log("urlAfterRedirects",event.urlAfterRedirects);

      if (event.url === '/app/tabs/replenishment-get-getall') {
        this.showMenu = false; //  ocultar menú
      } else {
        this.showMenu = true;
      }
    });
  }

  async checkForUpdates() {
    if (!this.swUpdate.isEnabled) return;
    const updateFound = await this.swUpdate.checkForUpdate();
    if (updateFound) {
      if (confirm('Nueva versión disponible. ¿Actualizar?')) {
        await this.swUpdate.activateUpdate();
        document.location.reload();
      }
    }
  }

  async ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.storedObject = this.userService.getStoredUserInfo();  
        if(this.storedObject && this.storedObject.data && this.storedObject.data.role==2){
          this.appPages=this.appPages2;
        }
        if(this.storedObject && this.storedObject.data && this.storedObject.data.role==3){
          this.appPages=this.appPages3;
        }
        if(this.storedObject && this.storedObject.data && this.storedObject.data.role==7){
          this.appPages=this.appPages7;
          //this.router.navigate(['/app/tabs/prodrex']);
          //this.router.navigateByUrl('/app/tabs/replenishment-withdrawn-getall');
        }
        if(this.storedObject && this.storedObject.data && this.storedObject.data.role==8){
          this.appPages=this.appPages8;
        }
        if(this.storedObject && this.storedObject.data && this.storedObject.data.role==9){
          this.appPages=this.appPages9;
        }
        if (event.url === '/login' || event.url === '/signup') {
          this.showMenu = false; // Hide the menu
        } else {
          this.showMenu = true; // Show the menu on other routes
        }

    // 👇 páginas donde quieres fullscreen
    const fullScreenRoutes = [
      '/app/tabs/replenishment-get-getall'
    ];

    this.showSplitPane = !fullScreenRoutes.includes(event.url);
        /*        if (event.url === '/app/tabs/replenishment-get-getall') {*/
          /*//this.dark = false; // Hide the menu*/
          /*this.showMenu=false*/
        /*}*/
      }
    });

    console.log('ngOninitprincipal ')
    this.network.online$.subscribe(online => {
        console.log('Estado:', online);
    });
        this.network.online$
        .pipe(skip(1))
        .subscribe(async online => {

            console.log('Estado:', online);

            if (!online) {

                await this.utilService.presentToast(
                    'No Hay Internet',
                    'danger',
                    5000
                );

            }

        });
  }

  ionViewDidEnter() {
    console.log("ionviewdidenter")
  }

  // getPosCategories() {
  //   this.opportunityService.getPosCategories(environment.i, environment.p).subscribe({
  //     next: response => {
  //       this.posCategories = response.result;
  //       console.log("response", response);
  //       console.log("pos category", this.posCategories);
  //       if (this.posCategories?.length) {
  //         this.appPages = this.posCategories.map((cat: any) => ({
  //           title: cat.name,
  //           url: `/app/tabs/map?id=${cat.id}`,  // ✅ id como query param
  //           icon: 'log-in',
  //           id: cat.id
  //         }));
  //       }
  //     },
  //     error: error => console.error('Error:', error),
  //     complete: () => {}
  //   });
  // }

  // getPosCategories() {
  //   this.opportunityService.getPosCategories(environment.i, environment.p).subscribe({
  //     next: response => {
  //       this.posCategories = response.result;
  //       console.log("response", response);
  //       console.log("pos category", this.posCategories);

  //       if (this.posCategories?.length) {
  //         this.appPages = this.posCategories.map((cat: any) => ({
  //           title: cat.name,
  //           url: '/app/tabs/map',
  //           icon: 'log-in',
  //           id: cat.id
  //         }));
  //       }
  //     },
  //     error: error => console.error('Error:', error),
  //     complete: () => {}
  //   });
  // }

  // getPosCategories() {
  //   this.opportunityService.getPosCategories(environment.i, environment.p).subscribe({
  //     next: response => {
  //       this.posCategories = response.result;
  //       console.log("response",response)
  //       console.log("pos category",this.posCategories)
  //       if(this.posCategories && this.posCategories.length && this.posCategories.length>0){
  //         this.appPages = [
  //           {
  //             title: this.posCategories[0].name,
  //             url: '/app/tabs/map',
  //             icon: 'log-in',
  //             id: this.posCategories[0].id
  //           },
  //           {
  //             title: this.posCategories[1].name,
  //             url: '/app/tabs/map',
  //             icon: 'log-in',
  //             id: this.posCategories[1].id
  //           },
  //           {
  //             title: this.posCategories[2].name,
  //             url: '/app/tabs/map',
  //             icon: 'log-in',
  //             id: this.posCategories[2].id
  //           },
  //           {
  //             title: this.posCategories[3].name,
  //             url: '/app/tabs/map',
  //             icon: 'log-in',
  //             id: this.posCategories[3].id
  //           },
  //         ];
  //       }
  //     },
  //     error: error => console.error('Error:', error),
  //     complete: () => {}
  //   });
  // }

  initializeApp() {
    this.platform.ready().then(() => {
      if (this.platform.is('hybrid')) {
        StatusBar.hide();
        SplashScreen.hide();
      }
    });
  }

  // checkLoginStatus() {
  //   return this.userData.isLoggedIn().then(loggedIn => {
  //     return this.updateLoggedInStatus(loggedIn);
  //   });
  // }

  // updateLoggedInStatus(loggedIn: boolean) {
  //   setTimeout(() => {
  //     this.loggedIn = loggedIn;
  //   }, 300);
  // }

  // listenForLoginEvents() {
  //   window.addEventListener('user:login', () => {
  //     this.updateLoggedInStatus(true);
  //   });

  //   window.addEventListener('user:signup', () => {
  //     this.updateLoggedInStatus(true);
  //   });

  //   window.addEventListener('user:logout', () => {
  //     this.updateLoggedInStatus(false);
  //   });
  // }

  logout() {
    this.userData.logout().then(() => {
      return this.router.navigateByUrl('/app/tabs/schedule');
    });
  }

  openTutorial() {
    this.menu.enable(false);
    this.storage.set('ion_did_tutorial', false);
    this.router.navigateByUrl('/tutorial');
  }

}
