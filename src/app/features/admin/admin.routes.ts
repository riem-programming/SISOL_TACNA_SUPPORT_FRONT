import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin-guard';

const ADMIN_ROUTES: Routes = [
  {
    path: 'verify',
    loadComponent: () => import('./pages/admin-verify/admin-verify'),
    title: 'Admin — Verificación',
  },
  {
    path: 'board',
    loadComponent: () => import('./pages/admin-board/admin-board'),
    canActivate: [adminGuard],
    title: 'Admin — Panel',
  },
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: '**', redirectTo: 'board' },
];

export default ADMIN_ROUTES;
