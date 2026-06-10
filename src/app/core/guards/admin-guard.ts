import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) return false;

  if (sessionStorage.getItem('admin_verified') !== 'true') {
    router.navigate(['/admin/verify']);
    return false;
  }
  return true;
};
