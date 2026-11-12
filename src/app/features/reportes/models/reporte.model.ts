export interface VentaPorCategoria {
  categoriaId: number;
  categoriaNombre: string;
  cantidadVendida: number;
  montoTotal: number;
}

export interface ProductoMasVendido {
  productoId: number;
  productoNombre: string;
  categoriaNombre: string;
  cantidadVendida: number;
  montoTotal: number;
}
