import { Routes } from '@angular/router';
import Panel from './panel';
import Home from './pages/home/home';

const PANEL_ROUTES: Routes = [
  {
    path: '',
    component: Panel,
    children: [
      {
        path: '',
        component: Home,
        pathMatch: 'full',
        title: 'Inicio',
      },
      {
        path: 'crear-solicitud',
        loadComponent: () => import('./pages/create-request/create-request'),
        title: 'Crear solicitud',
      },
      {
        path: 'mis-solicitudes',
        loadComponent: () => import('./pages/my-request/my-request'),
        title: 'Mis solicitudes',
      },
      {
        path: 'solicitud/:code/chat',
        loadComponent: () => import('./pages/user-ticket-chat/user-ticket-chat'),
        title: 'Chat',
      },
      {
        path: 'solicitud/:code',
        loadComponent: () => import('./pages/ticket-detail/ticket-detail'),
        title: 'Detalle de solicitud',
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];

export default PANEL_ROUTES;
