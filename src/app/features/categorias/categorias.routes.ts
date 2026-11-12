import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';

export const CATEGORIAS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/categoria-list/categoria-list').then((m) => m.CategoriaList), title: 'Categorías · PharmaSoft' },
  { path: 'nuevo', canActivate: [permisoGuard], data: { permiso: 'CATALOGO_ESCRIBIR' }, loadComponent: () => import('./pages/categoria-form/categoria-form').then((m) => m.CategoriaForm), title: 'Nueva categoría · PharmaSoft' },
  { path: ':id/editar', canActivate: [permisoGuard], data: { permiso: 'CATALOGO_ESCRIBIR' }, loadComponent: () => import('./pages/categoria-form/categoria-form').then((m) => m.CategoriaForm), title: 'Editar categoría · PharmaSoft' },
];
