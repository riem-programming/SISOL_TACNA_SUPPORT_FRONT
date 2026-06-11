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
  {
    path: 'ticket/:id',
    loadComponent: () => import('./pages/admin-ticket-detail/admin-ticket-detail'),
    canActivate: [adminGuard],
    title: 'Admin — Ticket',
  },
  {
    path: 'ticket/:id/chat',
    loadComponent: () => import('./pages/admin-ticket-chat/admin-ticket-chat'),
    canActivate: [adminGuard],
    title: 'Admin — Chat',
  },
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: '**', redirectTo: 'board' },
];

export default ADMIN_ROUTES;
