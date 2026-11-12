import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from '../auth/auth.model';
import { AuthService } from '../auth/auth-service';

export const permisoGuard: CanActivateFn = (route) => {
  const permiso = route.data['permiso'] as Permiso | undefined;
  if (!permiso || inject(AuthService).tienePermiso(permiso)) return true;
  return inject(Router).createUrlTree(['/acceso-denegado']);
};
