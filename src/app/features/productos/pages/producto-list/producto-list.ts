import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { Direccion, OrdenProducto, Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';
import { Paginador } from '../../../../shared/components/paginador/paginador';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

interface ParametrosProductos {
  pagina: number;
  tamanio: number;
  ordenarPor: OrdenProducto;
  direccion: Direccion;
}

const CAMPOS_ORDENABLES: OrdenProducto[] = ['id', 'nombre', 'precio', 'stock'];

@Component({
  selector: 'app-producto-list',
  imports: [RouterLink, CurrencyPipe, SiPermiso, Paginador],
  templateUrl: './producto-list.html',
  styleUrl: './producto-list.css',
})
export class ProductoList implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(20);
  protected readonly ordenarPor = signal<OrdenProducto>('nombre');
  protected readonly direccion = signal<Direccion>('asc');
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaFiltro = signal<number | null>(null);
  private readonly errorCategorias = signal('');

  private readonly recurso = rxResource<PaginaResponse<Producto>, ParametrosProductos>({
    params: () => ({
      pagina: this.pagina(),
      tamanio: this.tamanio(),
      ordenarPor: this.ordenarPor(),
      direccion: this.direccion(),
    }),
    stream: ({ params }) => this.productoService.listar(
      params.pagina,
      params.tamanio,
      params.ordenarPor,
      params.direccion,
    ),
  });

  protected readonly resultado = linkedSignal<PaginaResponse<Producto> | undefined, PaginaResponse<Producto> | null>({
    source: () => this.recurso.hasValue() ? this.recurso.value() : undefined,
    computation: (actual, anterior) => actual ?? anterior?.value ?? null,
  });
  protected readonly cargando = this.recurso.isLoading;
  protected readonly error = computed(() => {
    if (this.errorCategorias()) return this.errorCategorias();
    const error = this.recurso.error();
    if (!error) return '';
    return error instanceof HttpErrorResponse ? mensajeError(error) : 'No se pudieron cargar los productos.';
  });

  protected readonly productos = computed(() => {
    const lista = this.resultado()?.contenido ?? [];
    const categoriaId = this.categoriaFiltro();
    return categoriaId === null ? lista : lista.filter((producto) => producto.categoriaId === categoriaId);
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.errorCategorias.set('');
      },
      error: (err: HttpErrorResponse) => this.errorCategorias.set(mensajeError(err)),
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const pagina = Number(params.get('pagina'));
      const tamanio = Number(params.get('tamanio'));
      const ordenar = params.get('orden');
      const direccion = params.get('dir')?.toLowerCase();
      this.pagina.set(Number.isInteger(pagina) && pagina >= 0 ? pagina : 0);
      this.tamanio.set(Number.isInteger(tamanio) && tamanio >= 1 ? tamanio : 20);
      this.ordenarPor.set(CAMPOS_ORDENABLES.includes(ordenar as OrdenProducto) ? ordenar as OrdenProducto : 'nombre');
      this.direccion.set(direccion === 'desc' ? 'desc' : 'asc');
    });
  }

  cambiarTamanio(tamanio: number): void {
    this.tamanio.set(tamanio);
    this.pagina.set(0);
    this.actualizarUrl();
  }

  ordenar(campo: OrdenProducto): void {
    if (this.ordenarPor() === campo) {
      this.direccion.update((actual) => actual === 'asc' ? 'desc' : 'asc');
    } else {
      this.ordenarPor.set(campo);
      this.direccion.set('asc');
    }
    this.pagina.set(0);
    this.actualizarUrl();
  }

  filtrarPorCategoria(valor: string): void {
    this.categoriaFiltro.set(valor ? Number(valor) : null);
    if (this.pagina() !== 0) {
      this.pagina.set(0);
      this.actualizarUrl();
    }
  }

  irA(pagina: number): void {
    if (pagina < 0 || pagina >= (this.resultado()?.totalPaginas ?? 0)) return;
    this.pagina.set(pagina);
    this.actualizarUrl();
  }

  reintentar(): void {
    this.recurso.reload();
  }

  darDeBaja(producto: Producto): void {
    if (!window.confirm(`¿Dar de baja el producto «${producto.nombre}»?`)) return;
    this.productoService.darDeBaja(producto.id).subscribe({
      next: () => this.recurso.reload(),
      error: (err: HttpErrorResponse) => console.error(mensajeError(err)),
    });
  }

  private actualizarUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        pagina: this.pagina(),
        tamanio: this.tamanio(),
        orden: this.ordenarPor(),
        dir: this.direccion(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
