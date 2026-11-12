import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';

export const REPORTES_ROUTES: Routes = [
  {
    path: 'ventas-por-categoria',
    canActivate: [permisoGuard], data: { permiso: 'REPORTES_VER' },
    loadComponent: () => import('./pages/ventas-categoria/ventas-categoria').then((m) => m.VentasCategoria),
    title: 'Ventas por categoría · PharmaSoft',
  },
];
