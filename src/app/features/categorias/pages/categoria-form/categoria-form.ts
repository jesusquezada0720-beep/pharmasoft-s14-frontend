import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CategoriaRequest } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-categoria-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(CategoriaService);
  private readonly router = inject(Router);
  protected readonly error = signal('');
  protected readonly erroresApi = signal<Record<string, string>>({});
  protected readonly cargando = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]],
    descripcion: ['', [Validators.maxLength(200)]],
    estado: [true],
  });

  ngOnInit(): void {
    if (this.id()) {
      this.cargando.set(true);
      this.service.obtener(Number(this.id())).subscribe({
        next: (c) => { this.form.patchValue({ nombre: c.nombre, descripcion: c.descripcion ?? '', estado: c.estado }); this.cargando.set(false); },
        error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
      });
    }
  }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: CategoriaRequest = { nombre: v.nombre.trim(), descripcion: v.descripcion.trim() || null, estado: v.estado };
    this.cargando.set(true);
    this.error.set('');
    this.erroresApi.set({});
    const peticion = this.id() ? this.service.actualizar(Number(this.id()), dto) : this.service.crear(dto);
    peticion.subscribe({
      next: () => this.router.navigate(['/categorias']),
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.erroresApi.set(erroresDeValidacion(err));
        this.cargando.set(false);
      },
    });
  }

  limpiarErrorApi(campo: 'nombre' | 'descripcion'): void {
    this.erroresApi.update((errores) => {
      if (!(campo in errores)) return errores;
      const restantes = { ...errores };
      delete restantes[campo];
      return restantes;
    });
  }
}
