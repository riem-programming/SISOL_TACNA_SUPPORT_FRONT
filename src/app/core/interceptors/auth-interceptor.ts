import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformServer(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('access_token');
  let headers = req.headers;

  if (!(req.body instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({ headers });
  return next(authReq);
};
