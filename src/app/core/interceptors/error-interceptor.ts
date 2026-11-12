import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth-service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(catchError((error: unknown) => {
    if (error instanceof HttpErrorResponse
      && error.status === 401
      && !new URL(request.url, globalThis.location?.origin).pathname.endsWith('/auth/login')) {
      auth.cerrarSesion('expirada', router.url);
    }
    // Un 403 conserva la sesión; el componente presenta el mensaje del backend.
    return throwError(() => error);
  }));
};
