export function normalizar(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function coincide(texto: string, ...campos: (string | null | undefined)[]): boolean {
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  const contenido = normalizar(campos.filter((campo): campo is string => !!campo).join(' '));
  return palabras.every((palabra) => contenido.includes(palabra));
}
