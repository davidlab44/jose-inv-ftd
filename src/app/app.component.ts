import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { MenuController, Platform, ToastController } from '@ionic/angular';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Storage } from '@ionic/storage-angular';
import { UserData } from './providers/user-data';
import { OpportunityService } from './services/opportunity.service';
import { environment } from '../environments/environment';
import { Category } from './interfaces/category';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  categories: Category[] = [];
  

//appPages=[];
  
   appPages = [
     {
       title: 'Inicio',
       url: '/app/tabs/schedule',
       icon: 'calendar'
     },
     {
       title: 'Productos',
       url: '/app/tabs/readprdct',
       icon: 'map'
     },
     {
       title: 'Entradas',
       url: '/app/tabs/kitchen',
       icon: 'people'
     },
     {
       title: 'About',
       url: '/app/tabs/about',
       icon: 'information-circle'
     }
   ];
  
  loggedIn = false;
  dark = false;
  public showMenu = true; 
  posCategories: any[] = [];

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private storage: Storage,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private opportunityService:OpportunityService
  ) {
    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     // Check if the current route is '/login'
    //     if (event.url === '/login' || event.url === '/signup' ||  event.url === '/app/tabs/about' || event.url === '') {
    //       this.showMenu = true; // Hide the menu
    //       // if(event.url === '/app/tabs/about'){
    //       //   window.open('app/tabs/about', '_blank');
    //       // }
    //     } else {
    //       this.showMenu = true; // Show the menu on other routes
    //     }
    //   }
    // });
    // this.initializeApp();
  }

  async ngOnInit() {
    //console.log('hittttttttttttttttman')
    //await this.storage.create();

    //this.checkLoginStatus();
    //this.listenForLoginEvents();

    // this.swUpdate.versionUpdates.subscribe(async res => {
    //   const toast = await this.toastCtrl.create({
    //     message: 'Update available!',
    //     position: 'bottom',
    //     buttons: [
    //       {
    //         role: 'cancel',
    //         text: 'Reload'
    //       }
    //     ]
    //   });

    //   await toast.present();

    //   toast
    //     .onDidDismiss()
    //     .then(() => this.swUpdate.activateUpdate())
    //     .then(() => window.location.reload());
    // });

    this.showMenu=true;
    //this.getPosCategories();
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
