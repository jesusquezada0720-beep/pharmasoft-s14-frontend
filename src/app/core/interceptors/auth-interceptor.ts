import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth-service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const origenBase = globalThis.location?.origin ?? 'http://localhost';
  const urlApi = new URL(environment.apiUrl, origenBase);
  const urlRequest = new URL(request.url, globalThis.location?.origin ?? urlApi.origin);
  const vaALaApi = urlRequest.origin === urlApi.origin
    && (urlRequest.pathname === urlApi.pathname || urlRequest.pathname.startsWith(`${urlApi.pathname}/`));
  const token = inject(AuthService).token();

  if (!vaALaApi || !token) return next(request);
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
