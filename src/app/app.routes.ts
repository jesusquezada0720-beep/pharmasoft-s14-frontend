import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard, invitadoGuard } from './core/guards/auth-guard';
import { permisoGuard } from './core/guards/permiso-guard';
import { AccesoDenegado } from './shared/pages/acceso-denegado/acceso-denegado';
import { NoEncontrado } from './shared/pages/no-encontrado/no-encontrado';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · PharmaSoft',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
        title: 'Inicio · PharmaSoft',
      },
      {
        path: 'categorias',
        canActivate: [permisoGuard], data: { permiso: 'CATALOGO_LEER' },
        loadChildren: () => import('./features/categorias/categorias.routes').then((m) => m.CATEGORIAS_ROUTES),
      },
      {
        path: 'clientes',
        canActivate: [permisoGuard], data: { permiso: 'CLIENTES_LEER' },
        loadChildren: () => import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
      },
      {
        path: 'productos',
        canActivate: [permisoGuard], data: { permiso: 'CATALOGO_LEER' },
        loadChildren: () => import('./features/productos/productos.routes').then((m) => m.PRODUCTOS_ROUTES),
      },
      {
        path: 'ventas',
        canActivate: [permisoGuard], data: { permiso: 'VENTAS_LEER' },
        loadChildren: () => import('./features/ventas/ventas.routes').then((m) => m.VENTAS_ROUTES),
      },
      {
        path: 'reportes',
        canActivate: [permisoGuard], data: { permiso: 'REPORTES_VER' },
        loadChildren: () => import('./features/reportes/reportes.routes').then((m) => m.REPORTES_ROUTES),
      },
      { path: 'acceso-denegado', component: AccesoDenegado, title: 'Acceso denegado · PharmaSoft' },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
    title: 'Página no encontrada · PharmaSoft',
  },
];
