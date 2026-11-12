import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `<main class="denied"><section class="card"><p class="code">403</p><h1>Acceso denegado</h1><p>Tu usuario no tiene permiso para abrir esta página. Si necesitas acceso, solicítalo al administrador.</p><a class="btn btn-primary" routerLink="/inicio">Volver al inicio</a></section></main>`,
  styles: [`.denied{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f6fa}.card{max-width:480px;padding:32px;border-radius:14px;background:#fff;box-shadow:0 1px 8px #0f2e5c18}.code{margin:0;color:#b42318;font-size:14px;font-weight:800;letter-spacing:.12em}.card h1{margin:6px 0 12px;color:#0f2e5c}.card p:not(.code){margin-bottom:22px;color:#475569;line-height:1.55}.btn{display:inline-block;padding:9px 14px;border-radius:8px;text-decoration:none}.btn-primary{background:#0f2e5c;color:#fff}`],
})
export class AccesoDenegado {}
