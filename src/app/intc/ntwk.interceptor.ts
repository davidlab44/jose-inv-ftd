/*import { HttpInterceptorFn } from '@angular/common/http';*/

/*export const ntwkInterceptor: HttpInterceptorFn = (req, next) => {*/
  /*return next(req);*/
/*};*/




import { Injectable } from '@angular/core';

import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';

import {
  catchError,
  tap
} from 'rxjs/operators';

import { NetworkService } from '../services/local/network.service';

@Injectable()
export class NtwkInterceptor implements HttpInterceptor {

  constructor(
    private network: NetworkService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    return next.handle(req).pipe(

      tap(event => {

        // cualquier respuesta válida implica
        // que el backend respondió.

        this.network.setOnline();

      }),

      catchError((error: HttpErrorResponse) => {

        switch (error.status) {

          case 0:

            // Error de red:
            // sin Internet
            // servidor apagado
            // timeout TCP
            // DNS

            this.network.setOffline();
            break;

        }

        return throwError(() => error);

      })

    );

  }

}
