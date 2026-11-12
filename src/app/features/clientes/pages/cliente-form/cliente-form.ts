import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { ClienteRequest } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClienteService);
  private readonly router = inject(Router);
  protected readonly error = signal('');
  protected readonly erroresApi = signal<Record<string, string>>({});
  protected readonly cargando = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.maxLength(250)]],
    estado: [true],
  });

  ngOnInit(): void {
    if (!this.id()) return;
    this.cargando.set(true);
    this.service.obtener(Number(this.id())).subscribe({
      next: (cliente) => {
        this.form.patchValue({
          dni: cliente.dni,
          nombres: cliente.nombres,
          apellidos: cliente.apellidos,
          email: cliente.email,
          telefono: cliente.telefono ?? '',
          direccion: cliente.direccion ?? '',
          estado: cliente.estado,
        });
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.cargando()) return;
    const v = this.form.getRawValue();
    const dto: ClienteRequest = {
      dni: v.dni.trim(),
      nombres: v.nombres.trim(),
      apellidos: v.apellidos.trim(),
      email: v.email.trim(),
      telefono: v.telefono.trim() || null,
      direccion: v.direccion.trim() || null,
      estado: v.estado,
    };
    this.cargando.set(true);
    this.error.set('');
    this.erroresApi.set({});
    const peticion = this.id()
      ? this.service.actualizar(Number(this.id()), dto)
      : this.service.crear(dto);
    peticion.subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.erroresApi.set(erroresDeValidacion(err));
        this.cargando.set(false);
      },
    });
  }

  mensajeCampo(campo: 'dni' | 'nombres' | 'apellidos' | 'email' | 'telefono' | 'direccion'): string {
    const control = this.form.controls[campo];
    if (control.touched && control.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio.';
      if (control.errors['pattern'] && campo === 'dni') return 'El DNI debe contener exactamente 8 dígitos.';
      if (control.errors['pattern'] && campo === 'telefono') return 'El teléfono debe contener 9 dígitos.';
      if (control.errors['email']) return 'Ingresa un correo válido.';
      if (control.errors['minlength']) return 'Ingresa al menos 2 caracteres.';
      if (control.errors['maxlength']) return 'Se superó la longitud máxima permitida.';
    }
    return this.erroresApi()[campo] ?? '';
  }
}
