import { Hole, LatLng, haversineMeters } from '../../domain';

/**
 * Posición de tee aproximada de un hoyo, para **simular el GPS** al probar fuera del
 * campo (botón solo de desarrollo). Prioriza un tee real; si no hay, el extremo de la
 * línea de juego más lejano al green (el lado de salida); en último caso, el green.
 */
export function simulatedTeePosition(hole: Hole): LatLng {
  if (hole.tees.length > 0) return hole.tees[0];

  const line = hole.playLine;
  if (line.length >= 1) {
    const green = hole.green.center;
    const first = line[0];
    const last = line[line.length - 1];
    return haversineMeters(first, green) >= haversineMeters(last, green) ? first : last;
  }

  return hole.green.center;
}
