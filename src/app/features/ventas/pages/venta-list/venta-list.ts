import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TimeoutError, timeout } from 'rxjs';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { EstadoVenta, FiltroVentas, Venta } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

interface ParametrosVentas {
  filtro: FiltroVentas;
  pagina: number;
  tamanio: number;
}

const FILTRO_VACIO: FiltroVentas = { clienteId: null, estado: null, desde: null, hasta: null };

@Component({
  selector: 'app-venta-list',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe, SiPermiso, Paginador],
  templateUrl: './venta-list.html',
  styleUrl: './venta-list.css',
})
export class VentaList implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly filtroActivo = signal<FiltroVentas>(FILTRO_VACIO);
  protected readonly ahora = signal(new Date());
  private readonly errorValidacion = signal<string | null>(null);
  private readonly errorClientes = signal<string | null>(null);
  protected readonly filtros = this.fb.group({
    clienteId: this.fb.control<number | null>(null),
    estado: this.fb.control<EstadoVenta | null>(null),
    desde: this.fb.control<string | null>(null),
    hasta: this.fb.control<string | null>(null),
  });

  private readonly recurso = rxResource<PaginaResponse<Venta>, ParametrosVentas>({
    params: () => ({ filtro: this.filtroActivo(), pagina: this.pagina(), tamanio: this.tamanio() }),
    stream: ({ params }) => this.ventaService.buscar(params.filtro, params.pagina, params.tamanio).pipe(
      timeout({ first: 10000 }),
    ),
  });

  protected readonly resultado = linkedSignal<PaginaResponse<Venta> | undefined, PaginaResponse<Venta> | null>({
    source: () => this.recurso.hasValue() ? this.recurso.value() : undefined,
    computation: (actual, anterior) => actual ?? anterior?.value ?? null,
  });
  protected readonly cargando = this.recurso.isLoading;
  protected readonly error = computed(() => {
    if (this.errorValidacion()) return this.errorValidacion()!;
    if (this.errorClientes()) return this.errorClientes();
    const error = this.recurso.error();
    if (error instanceof TimeoutError) return 'El backend tardó más de 10 segundos en responder. Revisa que esté activo e inténtalo otra vez.';
    if (error instanceof HttpErrorResponse) return mensajeError(error);
    return error ? 'No se pudieron cargar las ventas. Inténtalo otra vez.' : null;
  });

  protected readonly totalPagina = computed(() =>
    (this.resultado()?.contenido ?? [])
      .filter((venta) => venta.estado === 'REGISTRADA')
      .reduce((suma, venta) => suma + venta.total, 0),
  );

  ngOnInit(): void {
    this.clienteService.listar(0, 100).subscribe({
      next: (respuesta) => {
        this.clientes.set(Array.isArray(respuesta) ? respuesta : respuesta.contenido);
        this.errorClientes.set(null);
      },
      error: (err: HttpErrorResponse) => this.errorClientes.set(mensajeError(err)),
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const cliente = Number(params.get('clienteId'));
      const rawEstado = params.get('estado');
      const desde = params.get('desde') || null;
      const hasta = params.get('hasta') || null;
      const filtro: FiltroVentas = {
        clienteId: Number.isInteger(cliente) && cliente > 0 ? cliente : null,
        estado: rawEstado === 'REGISTRADA' || rawEstado === 'ANULADA' ? rawEstado : null,
        desde,
        hasta,
      };
      const pagina = Number(params.get('pagina'));
      const tamanio = Number(params.get('tamanio'));
      this.filtros.patchValue(filtro, { emitEvent: false });
      this.filtroActivo.set(filtro);
      this.pagina.set(Number.isInteger(pagina) && pagina >= 0 ? pagina : 0);
      this.tamanio.set(Number.isInteger(tamanio) && tamanio >= 1 ? tamanio : 20);
      this.errorValidacion.set(null);
    });
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
    const filtro = this.filtros.getRawValue();
    if (filtro.desde && filtro.hasta && filtro.desde > filtro.hasta) {
      this.errorValidacion.set('La fecha «desde» no puede ser posterior a la fecha «hasta».');
      return;
    }
    this.errorValidacion.set(null);
    this.filtroActivo.set(filtro);
    this.pagina.set(0);
    this.actualizarUrl();
  }

  limpiar(): void {
    this.filtros.reset();
    this.buscar();
  }

  irA(pagina: number): void {
    if (pagina < 0 || pagina >= (this.resultado()?.totalPaginas ?? 0)) return;
    this.pagina.set(pagina);
    this.actualizarUrl();
  }

  cambiarTamanio(tamanio: number): void {
    this.tamanio.set(tamanio);
    this.pagina.set(0);
    this.actualizarUrl();
  }

  imprimirConsulta(): void {
    this.ahora.set(new Date());
    setTimeout(() => window.print(), 100);
  }

  reintentar(): void {
    this.recurso.reload();
  }

  private actualizarUrl(): void {
    const filtro = this.filtroActivo();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        clienteId: filtro.clienteId,
        estado: filtro.estado,
        desde: filtro.desde,
        hasta: filtro.hasta,
        pagina: this.pagina(),
        tamanio: this.tamanio(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
