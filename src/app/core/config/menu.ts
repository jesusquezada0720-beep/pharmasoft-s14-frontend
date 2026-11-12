import { Permiso } from '../auth/auth.model';

export interface MenuItem {
  etiqueta: string;
  ruta: string;
  icono: string;
  permiso?: Permiso;
}

export const MENU: MenuItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio', icono: '⌂' },
  { etiqueta: 'Categorías', ruta: '/categorias', icono: '▦', permiso: 'CATALOGO_LEER' },
  { etiqueta: 'Clientes', ruta: '/clientes', icono: '♙', permiso: 'CLIENTES_LEER' },
  { etiqueta: 'Productos', ruta: '/productos', icono: '💊', permiso: 'CATALOGO_LEER' },
  { etiqueta: 'Ventas', ruta: '/ventas', icono: '🧾', permiso: 'VENTAS_LEER' },
  { etiqueta: 'Reportes', ruta: '/reportes/ventas-por-categoria', icono: '▤', permiso: 'REPORTES_VER' },
];
