/** Formatea una distancia en metros, ej. 1234.5 → "1,235 m". */
export function formatearMetros(metros: number): string {
  return `${Math.round(metros).toLocaleString("es-DO")} m`;
}
