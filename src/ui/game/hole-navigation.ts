/**
 * Navegación entre hoyos (lógica pura). El índice es 1-based (Hoyo 1..count) y
 * nunca se sale del rango: en los extremos se queda quieto.
 */

/** Acota un índice de hoyo al rango válido 1..count. */
export function clampHoleIndex(index: number, count: number): number {
  if (count <= 0) return 1;
  return Math.min(Math.max(index, 1), count);
}

/** Hoyo anterior (no baja de 1). */
export function prevHole(index: number, count: number): number {
  return clampHoleIndex(index - 1, count);
}

/** Hoyo siguiente (no pasa de count). */
export function nextHole(index: number, count: number): number {
  return clampHoleIndex(index + 1, count);
}
