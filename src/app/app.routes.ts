import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { loggedInGuard } from './core/guards/logged-in-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/auth'),
    title: 'Inicio de sesión',
    canActivate: [loggedInGuard],
  },
  {
    path: 'panel',
    loadChildren: () => import('./features/panel/panel.routes'),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes'),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
