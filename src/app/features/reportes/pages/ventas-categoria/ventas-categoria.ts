import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TimeoutError, timeout } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { VentaPorCategoria } from '../../models/reporte.model';
import { ReporteService } from '../../services/reporte-service';

@Component({
  selector: 'app-ventas-categoria',
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './ventas-categoria.html',
  styleUrl: './ventas-categoria.css',
})
export class VentasCategoria implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly reporteService = inject(ReporteService);

  protected readonly filtros = this.fb.group({ desde: '', hasta: '' });
  protected readonly resultado = signal<VentaPorCategoria[] | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly rangoInvalido = signal(false);

  protected readonly maximoMonto = computed(() =>
    Math.max(0, ...(this.resultado() ?? []).map((fila) => fila.montoTotal)),
  );
  protected readonly totalUnidades = computed(() =>
    (this.resultado() ?? []).reduce((total, fila) => total + fila.cantidadVendida, 0),
  );
  protected readonly totalMonto = computed(() =>
    (this.resultado() ?? []).reduce((total, fila) => total + fila.montoTotal, 0),
  );

  ngOnInit(): void {
    this.generar();
  }

  generar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.rangoInvalido.set(true);
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }

    this.rangoInvalido.set(false);
    this.cargando.set(true);
    this.error.set(null);
    this.reporteService.ventasPorCategoria(desde || null, hasta || null).pipe(
      timeout({ first: 10000 }),
    ).subscribe({
      next: (filas) => {
        this.resultado.set(filas);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.resultado.set(null);
        this.cargando.set(false);
        this.error.set(err instanceof TimeoutError
          ? 'El backend tardó más de 10 segundos en responder. Inténtalo otra vez.'
          : err instanceof HttpErrorResponse
            ? mensajeError(err)
            : 'No se pudo generar el reporte. Inténtalo otra vez.');
      },
    });
  }

  porcentajeMonto(fila: VentaPorCategoria): number {
    const maximo = this.maximoMonto();
    return maximo > 0 ? Math.max(0, Math.min(100, (fila.montoTotal / maximo) * 100)) : 0;
  }
}
