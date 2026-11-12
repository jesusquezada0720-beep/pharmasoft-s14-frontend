import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-categoria-list',
  imports: [RouterLink, SiPermiso],
  templateUrl: './categoria-list.html',
  styleUrl: './categoria-list.css',
})
export class CategoriaList implements OnInit {
  private readonly service = inject(CategoriaService);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLocaleLowerCase();
    return this.categorias().filter((c) => `${c.nombre} ${c.descripcion ?? ''}`.toLocaleLowerCase().includes(texto));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.listar().subscribe({
      next: (datos) => { this.categorias.set(datos); this.cargando.set(false); },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  eliminar(categoria: Categoria): void {
    if (!window.confirm(`¿Eliminar la categoría «${categoria.nombre}»?`)) return;
    this.service.eliminar(categoria.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}

