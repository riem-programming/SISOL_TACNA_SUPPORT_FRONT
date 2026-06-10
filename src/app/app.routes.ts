import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/auth'),
    title: 'Inicio de sesión',
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
