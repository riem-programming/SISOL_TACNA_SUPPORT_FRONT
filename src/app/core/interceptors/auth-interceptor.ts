import { isPlatformServer } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { CurrentUserService } from '../services/current-user-service';

// Endpoints whose 401 is part of their own flow, not an expired session:
// login (wrong credentials) and verify-session (guard redirects silently)
const EXCLUDED_401_PATHS = ['/login', '/verify-session', '/read'];

// Dedupe guard: N concurrent requests failing with 401 must trigger
// the clear/navigate/snackbar side effects only once
let handlingExpiredSession = false;

function is401Excluded(url: string): boolean {
  const path = new URL(url, 'http://localhost').pathname;
  return EXCLUDED_401_PATHS.some((excluded) => path.endsWith(excluded));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return next(req);
  }

  // CurrentUserService is resolved lazily inside catchError (async, after
  // its constructor-issued request completes) to avoid a circular DI (NG0200).
  const injector = inject(Injector);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const token = localStorage.getItem('access_token');
  let headers = req.headers;

  if (!(req.body instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({ headers });
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !is401Excluded(req.url) && !handlingExpiredSession) {
        handlingExpiredSession = true;
        injector.get(CurrentUserService).clearSession();
        router.navigate(['']).finally(() => (handlingExpiredSession = false));
        snackBar.open('Tu sesión expiró. Vuelve a iniciar sesión.', 'Cerrar', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
      return throwError(() => error);
    }),
  );
};
