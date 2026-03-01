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

    let authReq = req;
    if (accessToken) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && this.authService.getRefreshToken()) {
          return this.authService.refreshToken().pipe(
            switchMap((res: any) => {
              const newToken = res?.token;
              if (newToken) {
                localStorage.setItem('DeepLines_accessToken', newToken);
                const newReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                return next.handle(newReq);
              }
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              this.authService.logout();
              this.router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }
}
