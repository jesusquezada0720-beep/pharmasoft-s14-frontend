import { Component, inject, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth-service';
import { mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly returnUrl = input<string | undefined>();
  readonly expirada = input<string | undefined>();
  protected readonly enviando = signal(false);
  protected readonly verClave = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ingresar(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const destino = this.destinoInterno(this.returnUrl());
        void this.router.navigateByUrl(destino);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.enviando.set(false);
      },
    });
  }

  private destinoInterno(destino: string | undefined): string {
    return destino?.startsWith('/') && !destino.startsWith('//') && destino !== '/login'
      ? destino
      : '/inicio';
  }
}

