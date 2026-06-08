import { ClubMatrix, ClubMatrixEntry, WeatherConditions } from '../models';
import { adjustForInclination, adjustCarryForWeather } from '../adjustments';

export interface RecommendationInput {
  /** Distancia real al objetivo (unidad del perfil). */
  targetDistance: number;
  /** Desnivel hasta el objetivo: + cuesta arriba, - cuesta abajo. Por defecto 0. */
  elevationChange?: number;
  /** Matriz de palos del jugador. */
  matrix: ClubMatrix;
  /**
   * Condiciones en que se midió la matriz. Solo se usa, junto con
   * `currentWeather`, cuando "Plays Like" está activo. Si falta, no se ajusta meteo.
   */
  baselineWeather?: WeatherConditions;
  /** Condiciones meteo actuales (Plays Like ON). Si falta, no se ajusta meteo. */
  currentWeather?: WeatherConditions;
}

export interface Recommendation {
  /** Palo recomendado. */
  club: ClubMatrixEntry;
  /** Carry estimado del palo recomendado (ajustado por meteo si aplica). */
  adjustedCarry: number;
  /** Objetivo tras aplicar la inclinación. */
  effectiveTarget: number;
  /** adjustedCarry - effectiveTarget (con signo): + pasa, - se queda corto. */
  deltaToTarget: number;
}

/**
 * Recomienda el palo cuyo carry se acerca más al objetivo efectivo.
 * - Inclinación: ajusta el objetivo (0 por defecto → Plays Like OFF).
 * - Meteo: solo se aplica si se pasan `baselineWeather` y `currentWeather`.
 * Devuelve null si la matriz no tiene palos. Empate → primer palo en orden.
 */
export function recommendClub(input: RecommendationInput): Recommendation | null {
  const { targetDistance, elevationChange = 0, matrix, baselineWeather, currentWeather } = input;
  if (matrix.entries.length === 0) {
    return null;
  }

  const effectiveTarget = adjustForInclination(targetDistance, elevationChange);
  const applyWeather = baselineWeather !== undefined && currentWeather !== undefined;

  let best: Recommendation | null = null;
  for (const club of matrix.entries) {
    const adjustedCarry = applyWeather
      ? adjustCarryForWeather(club.carryDistance, baselineWeather, currentWeather)
      : club.carryDistance;
    const deltaToTarget = adjustedCarry - effectiveTarget;
    if (best === null || Math.abs(deltaToTarget) < Math.abs(best.deltaToTarget)) {
      best = { club, adjustedCarry, effectiveTarget, deltaToTarget };
    }
  }

  return best;
}
