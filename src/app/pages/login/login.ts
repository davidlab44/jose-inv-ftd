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

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {

  constructor(private router: Router,private route: ActivatedRoute,) {}


  ngOnInit() {
    localStorage.clear();
    this.route.queryParams.subscribe(params => {
      const table = params['table'];
      console.log('table recibida:', table);
      if(table && table !=null && Number(table) && Number(table)>0){
        localStorage.setItem('mesa_id',table);
      }else{
        this.router.navigateByUrl('/app/tabs/map', { replaceUrl: true });
      }
    });
  }

  goToSchedule() {
    this.router.navigateByUrl('/app/tabs/schedule', { replaceUrl: true });
    //this.router.navigateByUrl('/app/tabs/schedule');
  }


}
