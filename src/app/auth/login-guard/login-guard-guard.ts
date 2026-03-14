import { inject } from '@angular/core';
import { AuthService } from './../auth-service';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
export const loginGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticated()) {
    router.navigate(['/blogs']);
    return false;
  } else {
    
    return true;
  }

};
