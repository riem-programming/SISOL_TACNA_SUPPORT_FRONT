import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { catchError, map, of } from 'rxjs';

export const loggedInGuard: CanActivateFn = (_route, _state) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isPlatformServer(platformId)) {
    return true;
  }

  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    return true;
  }

  return authService.verifySession().pipe(
    map((status: boolean) => {
      if (status) {
        router.navigate(['panel']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true)),
  );
};
