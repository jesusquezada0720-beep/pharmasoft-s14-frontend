import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TimeoutError, timeout } from 'rxjs';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-venta-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, SiPermiso],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly resultado = signal<PaginaResponse<Venta> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly ahora = signal(new Date());
  protected tamanio = 10;
  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });

  protected readonly totalPagina = computed(() =>
    (this.resultado()?.contenido ?? [])
      .filter((venta) => venta.estado === 'REGISTRADA')
      .reduce((suma, venta) => suma + venta.total, 0),
  );

  ngOnInit(): void {
    this.clienteService.listar(0, 100).subscribe({
      next: (respuesta) => this.clientes.set(Array.isArray(respuesta) ? respuesta : respuesta.contenido),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
    this.cargar();
  }

  resumenFiltros(): string {
    const filtro = this.filtros.getRawValue();
    const cliente = this.clientes().find((item) => item.id === filtro.clienteId);
    const partes = [
      cliente ? `cliente ${cliente.apellidos}, ${cliente.nombres}` : '',
      filtro.estado ? `estado ${filtro.estado}` : '',
      filtro.desde ? `desde ${filtro.desde}` : '',
      filtro.hasta ? `hasta ${filtro.hasta}` : '',
    ].filter(Boolean);
    return partes.length ? partes.join(' · ') : 'ninguno (todas las ventas)';
  }

  buscar(): void {
    const { desde, hasta } = this.filtros.getRawValue();
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.pagina.set(0);
    this.cargar();
  }

  limpiar(): void {
    this.filtros.reset();
    this.pagina.set(0);
    this.buscar();
  }

  irA(pagina: number): void {
    this.pagina.set(pagina);
    this.cargar();
  }

  cambiarTamanio(tamanio: string): void {
    this.tamanio = Number(tamanio) || 10;
    this.pagina.set(0);
    this.cargar();
  }

  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print(), 100);
  }

  private cargar(): void {
    const filtro: FiltroVentas = this.filtros.getRawValue();
    this.cargando.set(true);
    this.error.set(null);
    this.ventaService.buscar(filtro, this.pagina(), this.tamanio).pipe(
      timeout({ first: 10000 }),
    ).subscribe({
      next: (respuesta) => {
        this.resultado.set(respuesta);
        this.cargando.set(false);
      },
      error: (err: unknown) => {
        this.error.set(err instanceof TimeoutError
          ? 'El backend tardó más de 10 segundos en responder. Revisa que esté activo e inténtalo otra vez.'
          : err instanceof HttpErrorResponse
            ? mensajeError(err)
            : 'No se pudieron cargar las ventas. Inténtalo otra vez.');
        this.resultado.set(null);
        this.cargando.set(false);
      },
    });
  }
}

