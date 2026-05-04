import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';
import { ResUser } from '../../interfaces/res-user';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UtilService} from '../../services/util.service';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {

  public showMenu = true;
  login: UserOptions = { u: "kilosretiradosprovigas@gmail.com", p: "INBEMETAL2025@" };
  submitted = false;
  cleared:boolean=false;
  isMobile=false;
  onSignup(){}
  onSignupTecnico(){}
  constructor(private router: Router,
              private route: ActivatedRoute,
              private userService:UserService,
              private utilService:UtilService
             ) {}

  ngOnInit() {
    this.showMenu=true;
    localStorage.clear();
  }

  storedObject:any;
  async onLogin(form:NgForm){
    this.userService.getAll().subscribe({
      next: (response) => {
        if(this.login.u && this.login.u.length>1 && this.login.u &&this.login.u.length>1){
          response.forEach(user => {
            if(user.data.email==this.login.u&&user.data.p==this.login.p){
              try {
                  localStorage.setItem('storedObject', JSON.stringify(user));
                  //console.log('login success')
                  this.router.navigate(['/app/tabs/schedule']);
              } catch (error) {
                console.error('Error retrieving user info:', error);
              }
              return true;
            }
          });
                
        }else{
          this.utilService.presentToast('no se pudo loguear','danger',1000)
        }
      }
    });
  }
 
  goToSchedule() {
    this.router.navigateByUrl('/app/tabs/schedule', { replaceUrl: true });
    //this.router.navigateByUrl('/app/tabs/schedule');
  }


}
