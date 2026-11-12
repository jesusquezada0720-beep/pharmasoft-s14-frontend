import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { coincide } from '../../../../core/utils/texto';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';
import { VentaRequest } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

interface LineaForm {
  productoId: FormControl<number | null>;
  cantidad: FormControl<number>;
}

const MAX_RESULTADOS = 6;

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly ventaService = inject(VentaService);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly router = inject(Router);

  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly confirmando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly imprimirAlRegistrar = signal(true);

  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    detalles: this.fb.array<FormGroup<LineaForm>>([], Validators.required),
  });

  get detalles(): FormArray<FormGroup<LineaForm>> {
    return this.form.controls.detalles;
  }

  protected readonly buscarCliente = new FormControl('', { nonNullable: true });
  protected readonly buscarProducto = new FormControl('', { nonNullable: true });
  private readonly textoCliente = toSignal(this.buscarCliente.valueChanges, { initialValue: '' });
  private readonly textoProducto = toSignal(this.buscarProducto.valueChanges, { initialValue: '' });
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly clientesEncontrados = computed(() => {
    const texto = this.textoCliente().trim();
    if (!texto) return [];
    return this.clientes()
      .filter((cliente) => coincide(texto, cliente.nombres, cliente.apellidos, cliente.dni))
      .slice(0, MAX_RESULTADOS);
  });

  protected readonly productosEncontrados = computed(() => {
    const texto = this.textoProducto().trim();
    if (!texto) return [];
    return this.productos()
      .filter((producto) => coincide(texto, producto.nombre, producto.categoriaNombre))
      .slice(0, MAX_RESULTADOS);
  });

  protected readonly hayBusquedaCliente = computed(() => this.textoCliente().trim().length > 0);
  protected readonly hayBusquedaProducto = computed(() => this.textoProducto().trim().length > 0);

  private readonly productoPorId = computed(() => new Map(this.productos().map((producto) => [producto.id, producto])));

  protected readonly lineas = computed(() =>
    (this.valor().detalles ?? []).map((detalle) => {
      const producto = detalle.productoId ? this.productoPorId().get(detalle.productoId) : undefined;
      const cantidad = Number(detalle.cantidad) || 0;
      const precio = producto?.precio ?? 0;
      return {
        producto,
        precio,
        subtotal: redondear(precio * cantidad),
        excedeStock: !!producto && cantidad > producto.stock,
      };
    }),
  );

  protected readonly total = computed(() =>
    redondear(this.lineas().reduce((suma, linea) => suma + linea.subtotal, 0)),
  );

  protected readonly hayExcesoDeStock = computed(() => this.lineas().some((linea) => linea.excedeStock));
  protected readonly clienteElegido = computed(() =>
    this.clientes().find((cliente) => cliente.id === this.valor().clienteId),
  );

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(0, 100),
      productos: this.productoService.listar(0, 100, 'nombre', 'asc'),
    }).subscribe({
      next: ({ clientes, productos }) => {
        const listaClientes = Array.isArray(clientes) ? clientes : clientes.contenido;
        this.clientes.set(listaClientes.filter((cliente) => cliente.estado));
        this.productos.set(productos.contenido.filter((producto) => producto.estado && producto.stock > 0));
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(mensajeError(err));
        this.cargando.set(false);
      },
    });
  }

  elegirCliente(cliente: Cliente): void {
    this.form.controls.clienteId.setValue(cliente.id);
    this.buscarCliente.setValue('');
  }

  cambiarCliente(): void {
    this.form.controls.clienteId.setValue(null);
  }

  private nuevaLinea(productoId: number): FormGroup<LineaForm> {
    return this.fb.group({
      productoId: this.fb.control<number | null>(productoId, Validators.required),
      cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
    });
  }

  agregarProducto(producto: Producto): void {
    const existente = this.detalles.controls.find((linea) => linea.controls.productoId.value === producto.id);
    if (existente) {
      existente.controls.cantidad.setValue(Number(existente.controls.cantidad.value) + 1);
    } else {
      this.detalles.push(this.nuevaLinea(producto.id));
    }
    this.buscarProducto.setValue('');
  }

  agregarPrimero(evento: Event): void {
    evento.preventDefault();
    const primero = this.productosEncontrados()[0];
    if (primero) this.agregarProducto(primero);
  }

  cantidadEnDetalle(productoId: number): number {
    const linea = this.valor().detalles?.find((detalle) => detalle.productoId === productoId);
    return linea ? Number(linea.cantidad) || 0 : 0;
  }

  quitarLinea(indice: number): void {
    this.detalles.removeAt(indice);
  }

  revisar(): void {
    if (this.form.invalid || this.hayExcesoDeStock()) {
      this.form.markAllAsTouched();
      if (this.hayExcesoDeStock()) this.error.set('Corrige las cantidades que superan el stock disponible.');
      return;
    }
    this.error.set(null);
    this.confirmando.set(true);
  }

  cancelarConfirmacion(): void {
    this.confirmando.set(false);
  }

  confirmar(): void {
    const valores = this.form.getRawValue();
    const dto: VentaRequest = {
      clienteId: Number(valores.clienteId),
      detalles: valores.detalles.map((detalle) => ({
        productoId: Number(detalle.productoId),
        cantidad: Number(detalle.cantidad),
      })),
    };

    this.guardando.set(true);
    this.error.set(null);
    this.ventaService.registrar(dto).subscribe({
      next: (venta) => this.router.navigate(['/ventas', venta.id], {
        queryParams: this.imprimirAlRegistrar() ? { nueva: 1, imprimir: 1 } : { nueva: 1 },
      }),
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.confirmando.set(false);
        this.error.set(mensajeError(err));
      },
    });
  }
}
