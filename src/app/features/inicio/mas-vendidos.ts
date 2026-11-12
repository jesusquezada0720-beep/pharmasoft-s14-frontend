import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { mensajeError } from '../../core/utils/http-error';
import { ProductoMasVendido } from '../reportes/models/reporte.model';
import { ReporteService } from '../reportes/services/reporte-service';

@Component({
  selector: 'app-mas-vendidos',
  imports: [CurrencyPipe],
  templateUrl: './mas-vendidos.html',
  styleUrl: './mas-vendidos.css',
})
export class MasVendidos {
  private readonly reportes = inject(ReporteService);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filas = toSignal(
    this.reportes.productosMasVendidos().pipe(
      catchError((error: unknown) => {
        const mensaje = error instanceof HttpErrorResponse
          ? mensajeError(error)
          : 'No se pudo generar el reporte.';
        this.error.set(mensaje);
        return of([] as ProductoMasVendido[]);
      }),
      tap(() => this.cargando.set(false)),
    ),
    { initialValue: [] as ProductoMasVendido[] },
  );
}
