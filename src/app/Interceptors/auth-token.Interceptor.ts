import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth-service';
import { Router } from '@angular/router';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('DeepLines_accessToken');
    const accessTokenExpire = localStorage.getItem('DeepLines_accessTokenExpire');


    const url = req.url || '';
    if (url.includes('/Auth/refresh') || url.includes('/Auth/login')) {
      return next.handle(req);
    }

    let authReq = req;

    if (accessToken && accessTokenExpire) {

      const now = Date.now();
      const expireTime = new Date(accessTokenExpire).getTime();

      if (expireTime > now) {
        authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return next.handle(authReq).pipe(
          catchError((err) => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
              this.router.navigate(['/auth/login']);
            }
            return throwError(() => err);
          })
        );

      } else {
        console.log("refresh token ...");
        return this.authService.refreshToken().pipe(
          switchMap((tokens) => {
            this.authService.storeTokens(tokens);

            const newAuthReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens.jwtToken}`,
              },
            });

            return next.handle(newAuthReq);
          }),

          catchError((err) => {
            this.router.navigate(['/auth/login']);
            return throwError(() => err);
          })
        );
      }
    }

    return next.handle(req);
  }
}