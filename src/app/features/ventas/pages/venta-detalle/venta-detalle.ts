import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, computed, inject, input, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, TimeoutError, catchError, of, timeout } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

@Component({
  selector: 'app-venta-detalle',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './venta-detalle.html',
  styleUrl: './venta-detalle.css',
})
export class VentaDetalle implements OnChanges, OnDestroy {
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly id = input.required<string>();
  readonly nueva = input<string>();
  readonly imprimir = input<string>();

  protected readonly venta = signal<Venta | null>(null);
  protected readonly cliente = signal<Cliente | null>(null);
  protected readonly cargando = signal(true);
  protected readonly anulando = signal(false);
  protected readonly error = signal('');
  protected readonly fechaImpresion = signal(new Date());
  protected readonly numero = computed(() => String(this.venta()?.id ?? '').padStart(6, '0'));
  protected readonly unidades = computed(() =>
    (this.venta()?.detalles ?? []).reduce((suma, detalle) => suma + detalle.cantidad, 0),
  );

  private solicitudVenta?: Subscription;
  private solicitudCliente?: Subscription;

  /** El router puede reutilizar el componente al pasar de una venta a otra. */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id']) {
      this.cargar();
      return;
    }

    // Los parámetros de impresión pueden cambiar sin que cambie la venta.
    // No vuelvas a consultar el backend por un cambio de query param.
    if (changes['imprimir']?.currentValue === '1' && this.venta()) {
      this.imprimirComprobanteAutomaticamente(Number(this.id()));
    }
  }

  ngOnDestroy(): void {
    this.solicitudVenta?.unsubscribe();
    this.solicitudCliente?.unsubscribe();
  }

  protected cargar(): void {
    this.solicitudVenta?.unsubscribe();
    this.solicitudCliente?.unsubscribe();

    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
      this.venta.set(null);
      this.cliente.set(null);
      this.error.set('El número de venta no es válido.');
      this.cargando.set(false);
      return;
    }

    this.venta.set(null);
    this.cliente.set(null);
    this.error.set('');
    this.cargando.set(true);
    this.solicitudVenta = this.ventaService.obtener(id).pipe(
      timeout({ first: 10000 }),
    ).subscribe({
      next: (venta) => {
        if (Number(this.id()) !== id) return;
        this.venta.set(venta);
        this.cargando.set(false);
        this.fechaImpresion.set(new Date());

        if (this.imprimir() === '1') this.imprimirComprobanteAutomaticamente(id);

        // El comprobante se muestra sin esperar al endpoint opcional del DNI.
        this.solicitudCliente = this.clienteService.obtener(venta.clienteId).pipe(
          timeout({ first: 3000 }),
          catchError(() => of(null)),
        ).subscribe((cliente) => {
          if (Number(this.id()) !== id) return;
          this.cliente.set(cliente);
        });
      },
      error: (err: unknown) => {
        if (Number(this.id()) !== id) return;
        this.error.set(err instanceof TimeoutError
          ? 'La respuesta tardó más de 10 segundos. Intenta cargar la venta otra vez.'
          : err instanceof HttpErrorResponse
            ? mensajeError(err)
            : 'No se pudo cargar la venta. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  protected imprimirComprobante(): void {
    if (this.cargando() || !this.venta()) return;
    this.fechaImpresion.set(new Date());
    this.changeDetector.detectChanges();
    setTimeout(() => window.print(), 250);
  }

  private imprimirComprobanteAutomaticamente(id: number): void {
    if (this.cargando() || this.venta()?.id !== id) return;
    this.fechaImpresion.set(new Date());
    this.changeDetector.detectChanges();
    setTimeout(() => {
      if (!this.cargando() && this.venta()?.id === id) window.print();
    }, 300);
  }

  protected anular(): void {
    const venta = this.venta();
    if (!venta || venta.estado === 'ANULADA') return;
    if (!window.confirm(`¿Anular la venta #${venta.id}?`)) return;

    this.anulando.set(true);
    this.error.set('');
    this.ventaService.anular(venta.id).subscribe({
      next: (actualizada) => {
        this.venta.set(actualizada);
        this.anulando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.anulando.set(false);
      },
    });
  }
}
