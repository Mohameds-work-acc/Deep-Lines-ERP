import { inject } from '@angular/core';
import { AuthService } from './../auth-service';
import { CanActivateFn } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {

    return false;
  } else {
    return true;
  }

};
