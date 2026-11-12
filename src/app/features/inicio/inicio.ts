import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth-service';
import { MasVendidos } from './mas-vendidos';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MasVendidos],
  template: `
    <section class="welcome">
      <p class="eyebrow">PHARMASOFT · OPERACIONES</p>
      <h1>Tu botica, en orden.</h1>
      <p class="intro">Administra el catálogo y la información de tus clientes desde un solo lugar.</p>
      <div class="actions"><a class="button button-primary" routerLink="/clientes">Ver clientes <span>→</span></a><a class="button" routerLink="/categorias">Explorar categorías</a></div>
    </section>
    <section class="quick-grid" aria-label="Accesos rápidos">
      <a class="quick-card" routerLink="/categorias"><span class="quick-icon">▦</span><span><small>CATÁLOGO</small><strong>Categorías</strong><em>Organiza tus productos</em></span><b>↗</b></a>
      <a class="quick-card" routerLink="/clientes"><span class="quick-icon">♙</span><span><small>RELACIONES</small><strong>Clientes</strong><em>Consulta y actualiza registros</em></span><b>↗</b></a>
    </section>
    @if (auth.tienePermiso('REPORTES_VER')) {
      @defer (on viewport) {
        <app-mas-vendidos />
      } @placeholder {
        <p class="report-placeholder">Productos más vendidos</p>
      } @loading (minimum 300ms) {
        <p class="report-placeholder">Cargando reporte…</p>
      } @error {
        <p class="report-error">No se pudo cargar el reporte.</p>
      }
    }
    <p class="note"><span class="note-dot"></span> Servicios de PharmaSoft disponibles</p>
  `,
  styles: [`
    .welcome { padding: clamp(27px, 5vw, 58px); border: 1px solid #e3e8f0; border-radius: 22px; background: linear-gradient(115deg,#fff 15%,#eef2f8 100%); }
    .eyebrow { margin: 0 0 18px; color: #0f2e5c; font-size: 10px; font-weight: 750; letter-spacing: .16em; }
    h1 { max-width: 640px; margin: 0; color: #0f2e5c; font-size: clamp(38px, 6vw, 64px); line-height: 1.02; letter-spacing: -.06em; }
    .intro { max-width: 450px; margin: 18px 0 26px; color: #6b7280; line-height: 1.7; font-size: 14px; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .button { display: inline-flex; gap: 18px; align-items: center; padding: 11px 15px; border: 1px solid #cbd5e1; border-radius: 10px; color: #1f2937; text-decoration: none; font-size: 12px; font-weight: 650; }
    .button-primary { border-color: #0f2e5c; background: #0f2e5c; color: #fff; }
    .quick-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px; margin-top: 18px; }
    .quick-card { display: flex; align-items: center; gap: 14px; padding: 19px; border: 1px solid #e3e8f0; border-radius: 15px; background: #fff; color: inherit; text-decoration: none; }
    .quick-card > span:nth-child(2) { display: grid; gap: 4px; }
    .quick-card small { color: #6b7280; font-size: 9px; font-weight: 750; letter-spacing: .12em; }
    .quick-card strong { color: #1f2937; font-size: 15px; }
    .quick-card em { color: #6b7280; font-size: 11px; font-style: normal; }
    .quick-card b { margin-left: auto; color: #0f2e5c; }
    .quick-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 12px; background: #eef2f8; color: #0f2e5c; font-size: 20px; }
    .note { display: flex; align-items: center; gap: 8px; margin: 21px 3px; color: #6b7280; font-size: 11px; }
    .note-dot { width: 7px; height: 7px; border-radius: 50%; background: #f2a900; }
    .report-placeholder, .report-error { margin: 18px 0 0; padding: 18px; border: 1px solid #e3e8f0; border-radius: 15px; background: #fff; color: #6b7280; font-size: 13px; }
    .report-error { color: #9b1c1c; }
    @media(max-width:600px) { .quick-grid { grid-template-columns: 1fr; } }
  `],
})
export class Inicio {
  protected readonly auth = inject(AuthService);
}
