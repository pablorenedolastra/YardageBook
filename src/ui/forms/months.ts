/** Nombres de los meses en español, índice 0 = Enero. */
export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/** Nombre del mes (1-12); cadena vacía si está fuera de rango. */
export function monthName(month: number): string {
  return MONTHS[month - 1] ?? '';
}
