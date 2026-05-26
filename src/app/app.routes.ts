import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/auth'),
    title: 'RS Studio: Acceso',
  },
  {
    path: 'panel',
    loadComponent: () => import('./features/panel/panel'),
    title: 'RS Studio',
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'panel',
  },
];
