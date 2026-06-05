/** Devuelve un color hex de 8 dígitos (#RRGGBBAA) aplicando opacidad a un hex de 6. */
export function withOpacity(hex: string, alpha: number): string {
  if (alpha < 0 || alpha > 1) {
    throw new Error(`alpha debe estar entre 0 y 1, recibido: ${alpha}`);
  }
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return (hex + channel).toUpperCase();
}
