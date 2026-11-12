export type EstadoVenta = 'REGISTRADA' | 'ANULADA';

export interface DetalleVenta {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  fecha: string;
  clienteId: number;
  clienteNombre: string;
  estado: EstadoVenta;
  total: number;
  detalles: DetalleVenta[];
}

export interface VentaRequest {
  clienteId: number;
  detalles: { productoId: number; cantidad: number }[];
}

export interface FiltroVentas {
  clienteId: number | null;
  estado: EstadoVenta | null;
  desde: string | null;
  hasta: string | null;
}
