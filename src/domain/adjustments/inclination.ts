/**
 * Metros efectivos añadidos por cada metro de desnivel. Parametrizable;
 * 1.0 = "juega el desnivel tal cual" (regla de pulgar habitual en golf).
 */
export const INCLINATION_FACTOR = 1.0;

/**
 * Ajusta la distancia objetivo según el desnivel hasta el objetivo.
 * @param distance distancia real al objetivo (unidad del perfil)
 * @param elevationChange desnivel hasta el objetivo: positivo = cuesta arriba,
 *   negativo = cuesta abajo (misma unidad que distance)
 * @returns distancia efectiva que la bola debe recorrer
 */
export function adjustForInclination(distance: number, elevationChange: number): number {
  return distance + elevationChange * INCLINATION_FACTOR;
}
