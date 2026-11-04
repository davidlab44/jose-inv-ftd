import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../../services/user.service';
import { TService } from '../../../../services/mnt/t.service'; 

interface WsUser {
  id: number;
  data: {
    name?: string;
    img?: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-ws',
  templateUrl: './patch.html',
  styleUrls: ['./patch.scss'],
  standalone: false
})
export class PatchPage implements OnInit {
  users: WsUser[] = [];
  loading = false;
  errorMessage = '';
  readonly defaultImage = 'https://s3mntdev.inbemetal.com/mntdev/user_thumbnail.jpg';

  constructor(private userService: UserService, private router: Router,private tService:TService, ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getAll().subscribe({
      next: (users: WsUser[]) => {
        this.users = Array.isArray(users) ? users : [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('[WS] Error cargando usuarios:', error);
        this.errorMessage = 'No fue posible cargar los usuarios.';
        this.loading = false;
      }
    });
  }


  ionViewDidEnter(){
    this.loadTask();
  }

  taskList:any[]=[];
  loadTask(){
    this.tService.getAll().subscribe({
      next:(r)=>{
        this.taskList=r;
        console.log('loadTask response',this.taskList);
      },
      error:err=>console.error('loadTask',err)
    })
  }


  openUser(user: WsUser): void {
    const pageRoute = `/app/tabs/mnt-ws-own`;
    this.router.navigate([pageRoute], {
      state: {
        user: user,
        taskList: this.taskList,
        custom: 'prueba'
      }
    });
    //this.router.navigate(['/own', user.id]); // Ruta esperada: own/:wkr
  }

  trackById(_index: number, user: WsUser): number {
    return user.id;
  }

  imageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.src !== this.defaultImage) image.src = this.defaultImage;
  }
}
