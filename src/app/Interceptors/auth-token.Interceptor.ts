import { HttpInterceptorFn , HttpErrorResponse} from "@angular/common/http";
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';


export const authTokenInterceptor :HttpInterceptorFn = (req, next) => {


  const router = inject(Router);
  const authService = inject(AuthService);


  const accessToken = localStorage.getItem('DeepLines_accessToken');

  if (accessToken) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
    });
    return next(clonedReq);
  } else {
    return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken()) {
        // Try to refresh the token once
        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res.token;
            if (newToken) {
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(newReq);
            }
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
      })
    );
  }
};
