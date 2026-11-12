import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  imports: [],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {
  readonly pagina = input.required<number>();
  readonly tamanio = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly totalElementos = input.required<number>();
  readonly paginaCambiada = output<number>();
  readonly tamanioCambiado = output<number>();

  protected readonly tamaniosDisponibles = [10, 20, 50, 100];

  cambiarTamanio(valor: string): void {
    const tamanio = Number(valor);
    if (Number.isInteger(tamanio) && tamanio > 0 && tamanio <= 100) {
      this.tamanioCambiado.emit(tamanio);
    }
  }
}
