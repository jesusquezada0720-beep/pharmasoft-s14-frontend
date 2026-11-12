import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/guards/permiso-guard';
import { VentaList } from './pages/venta-list/venta-list';
import { VentaForm } from './pages/venta-form/venta-form';
import { VentaDetalle } from './pages/venta-detalle/venta-detalle';

export const VENTAS_ROUTES: Routes = [
  { path: '', component: VentaList, title: 'Consulta de ventas' },
  { path: 'nueva', canActivate: [permisoGuard], data: { permiso: 'VENTAS_REGISTRAR' }, component: VentaForm, title: 'Nueva venta' },
  { path: ':id', component: VentaDetalle, title: 'Detalle de venta' },
];
