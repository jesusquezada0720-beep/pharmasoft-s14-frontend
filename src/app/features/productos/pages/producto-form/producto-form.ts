import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { Categoria } from '../../../categorias/models/categoria.model';
import { CategoriaService } from '../../../categorias/services/categoria-service';
import { ProductoRequest } from '../../models/producto.model';
import { ProductoService } from '../../services/producto-service';

@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.html',
  styleUrl: './producto-form.css',
})
export class ProductoForm implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly categoriaOriginal = signal<number | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly erroresApi = signal<Record<string, string>>({});

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    precio: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    stock: this.fb.control<number | null>(0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
    estado: [true],
    categoriaId: this.fb.control<number | null>(null, Validators.required),
  });

  protected readonly opciones = computed(() =>
    this.categorias().filter((categoria) => categoria.estado || categoria.id === this.categoriaOriginal()),
  );
  protected readonly hayCategoriasActivas = computed(() => this.categorias().some((categoria) => categoria.estado));

  private readonly categoriaElegida = toSignal(this.form.controls.categoriaId.valueChanges, { initialValue: null });
  protected readonly categoriaInactiva = computed(() => {
    const categoria = this.categorias().find((item) => item.id === this.categoriaElegida());
    return !!categoria && !categoria.estado;
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.categoriaService.listar().subscribe({
        next: (categorias) => { this.categorias.set(categorias); this.cargando.set(false); },
        error: (err: HttpErrorResponse) => this.fallarCarga(err),
      });
      return;
    }

    forkJoin({
      categorias: this.categoriaService.listar(),
      producto: this.productoService.obtener(Number(id)),
    }).subscribe({
      next: ({ categorias, producto }) => {
        this.categorias.set(categorias);
        this.categoriaOriginal.set(producto.categoriaId);
        this.form.setValue({
          nombre: producto.nombre,
          precio: producto.precio,
          stock: producto.stock,
          estado: producto.estado,
          categoriaId: producto.categoriaId,
        });
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => this.fallarCarga(err),
    });
  }

  esEdicion(): boolean { return !!this.id(); }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.categoriaInactiva() || this.guardando()) return;

    const valores = this.form.getRawValue();
    const dto: ProductoRequest = {
      nombre: valores.nombre.trim(),
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      estado: valores.estado,
      categoriaId: Number(valores.categoriaId),
    };
    const id = this.id();
    const peticion = id
      ? this.productoService.actualizar(Number(id), dto)
      : this.productoService.crear(dto);

    this.guardando.set(true);
    this.error.set('');
    this.erroresApi.set({});
    peticion.subscribe({
      next: () => this.router.navigate(['/productos']),
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.erroresApi.set(erroresDeValidacion(err));
        this.guardando.set(false);
      },
    });
  }

  limpiarErrorApi(campo: keyof ProductoRequest): void {
    this.erroresApi.update((errores) => {
      if (!(campo in errores)) return errores;
      const restantes = { ...errores };
      delete restantes[campo];
      return restantes;
    });
  }

  mensajeCampo(campo: 'nombre' | 'precio' | 'stock' | 'categoriaId'): string {
    const control = this.form.controls[campo];
    if (control.touched && control.errors) {
      if (control.errors['required']) return campo === 'categoriaId' ? 'Selecciona una categoría.' : 'Este campo es obligatorio.';
      if (control.errors['minlength']) return 'El nombre debe tener al menos 3 caracteres.';
      if (control.errors['maxlength']) return 'El nombre admite hasta 150 caracteres.';
      if (control.errors['min'] && campo === 'precio') return 'El precio debe ser mayor o igual a S/ 0.01.';
      if (control.errors['min'] && campo === 'stock') return 'El stock no puede ser negativo.';
      if (control.errors['pattern']) return 'El stock debe ser un número entero.';
    }
    return this.erroresApi()[campo] ?? '';
  }

  private fallarCarga(err: HttpErrorResponse): void {
    this.error.set(mensajeError(err));
    this.cargando.set(false);
  }
}
