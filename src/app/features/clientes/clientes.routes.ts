import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';

export const CLIENTES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/cliente-list/cliente-list').then((m) => m.ClienteList), title: 'Clientes · PharmaSoft' },
  { path: 'nuevo', canActivate: [permisoGuard], data: { permiso: 'CLIENTES_ESCRIBIR' }, loadComponent: () => import('./pages/cliente-form/cliente-form').then((m) => m.ClienteForm), title: 'Nuevo cliente · PharmaSoft' },
  { path: ':id/editar', canActivate: [permisoGuard], data: { permiso: 'CLIENTES_ESCRIBIR' }, loadComponent: () => import('./pages/cliente-form/cliente-form').then((m) => m.ClienteForm), title: 'Editar cliente · PharmaSoft' },
];
