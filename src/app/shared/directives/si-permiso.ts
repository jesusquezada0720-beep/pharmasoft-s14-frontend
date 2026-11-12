import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Permiso } from '../../core/auth/auth.model';
import { AuthService } from '../../core/auth/auth-service';

@Directive({ selector: '[appSiPermiso]', standalone: true })
export class SiPermiso {
  private readonly auth = inject(AuthService);
  private readonly template = inject(TemplateRef<unknown>);
  private readonly container = inject(ViewContainerRef);
  private visible = false;

  readonly appSiPermiso = input.required<Permiso>();

  constructor() {
    effect(() => {
      const permitido = this.auth.tienePermiso(this.appSiPermiso());
      if (permitido && !this.visible) {
        this.container.createEmbeddedView(this.template);
        this.visible = true;
      } else if (!permitido && this.visible) {
        this.container.clear();
        this.visible = false;
      }
    });
  }
}
