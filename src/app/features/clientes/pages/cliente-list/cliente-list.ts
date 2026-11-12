import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { mensajeError } from '../../../../core/utils/http-error';
import { SiPermiso } from '../../../../shared/directives/si-permiso';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink, SiPermiso],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly service = inject(ClienteService);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<'dni' | 'apellidos'>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');
  protected readonly totalPaginas = signal(0);
  protected readonly totalElementos = signal(0);
  protected readonly ultima = signal(true);
  protected readonly filtro = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal('');
  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLocaleLowerCase();
    if (!texto) return this.clientes();
    return this.clientes().filter((cliente) =>
      cliente.dni.toLocaleLowerCase().includes(texto)
      || `${cliente.nombres} ${cliente.apellidos}`.toLocaleLowerCase().includes(texto),
    );
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion()).subscribe({
      next: (respuesta) => {
        this.clientes.set(respuesta.contenido);
        this.pagina.set(respuesta.pagina);
        this.tamanio.set(respuesta.tamanio);
        this.totalPaginas.set(respuesta.totalPaginas);
        this.totalElementos.set(respuesta.totalElementos);
        this.ultima.set(respuesta.ultima);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  cambiarTamanio(valor: string): void {
    this.tamanio.set(Number(valor));
    this.pagina.set(0);
    this.cargar();
  }

  ordenar(campo: 'dni' | 'apellidos'): void {
    if (this.ordenarPor() === campo) this.direccion.update((actual) => actual === 'asc' ? 'desc' : 'asc');
    else { this.ordenarPor.set(campo); this.direccion.set('asc'); }
    this.pagina.set(0);
    this.cargar();
  }

  anterior(): void {
    if (this.pagina() > 0) { this.pagina.update((actual) => actual - 1); this.cargar(); }
  }

  siguiente(): void {
    if (!this.ultima()) { this.pagina.update((actual) => actual + 1); this.cargar(); }
  }

  darDeBaja(cliente: Cliente): void {
    if (!window.confirm(`¿Dar de baja a ${cliente.nombres} ${cliente.apellidos}?`)) return;
    this.service.eliminar(cliente.id).subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => this.error.set(mensajeError(err)),
    });
  }
}

