import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, _state) => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isPlatformServer(platformId)) {
    return false;
  }

  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    router.navigate(['']);
    return false;
  }

  return authService.verifySession().pipe(
    map((status: boolean) => {
      if (!status) {
        router.navigate(['']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      router.navigate(['']);
      return of(false);
    }),
  );
};
