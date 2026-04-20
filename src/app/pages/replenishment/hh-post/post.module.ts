import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PostPage } from './post';
import { PostPageRoutingModule } from './post-routing.module';
import { SharedModule } from '../../../shared/shared.module'; // ✅ Correcto
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PipesModule } from '../../../pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostPageRoutingModule,
    SharedModule, // ✅ Aquí es donde entra el componente
    PipesModule,
    ReactiveFormsModule,

  ],
  declarations: [
    PostPage,
  ]
})
export class PostModule {}

