import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: '<section class="not-found"><p>ERROR 404</p><h1>No encontramos esa página.</h1><a routerLink="/inicio">Volver al inicio →</a></section>',
  styles: [`.not-found { display:grid; min-height:55vh; align-content:center; justify-items:start; max-width:620px; margin:auto; } p { color:#0f2e5c; font-size:11px; font-weight:750; letter-spacing:.16em; } h1 { color:#0f2e5c; font-size:clamp(32px,5vw,52px); letter-spacing:-.05em; } a { color:#0f2e5c; font-weight:650; text-decoration:none; }`],
})
export class NoEncontrado {}
