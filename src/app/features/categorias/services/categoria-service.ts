import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Categoria, CategoriaRequest } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categorias`;

  listar(): Observable<Categoria[]> { return this.http.get<Categoria[]>(this.url); }
  obtener(id: number): Observable<Categoria> { return this.http.get<Categoria>(`${this.url}/${id}`); }
  crear(dto: CategoriaRequest): Observable<Categoria> { return this.http.post<Categoria>(this.url, dto); }
  actualizar(id: number, dto: CategoriaRequest): Observable<Categoria> { return this.http.put<Categoria>(`${this.url}/${id}`, dto); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
