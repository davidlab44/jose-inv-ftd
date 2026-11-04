

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private readonly onlineSubject =
    new BehaviorSubject<boolean>(true);

  readonly online$ = this.onlineSubject.asObservable();

  get isOnline(): boolean {
    return this.onlineSubject.value;
  }

  setOnline(): void {

    if (!this.onlineSubject.value) {

      console.log('🟢 Conexión restaurada');

      this.onlineSubject.next(true);

    }

  }

  setOffline(): void {

    if (this.onlineSubject.value) {

      console.log('🔴 Sin conexión con el servidor');

      this.onlineSubject.next(false);

    }

  }

}
