import { ClubMatrix, ClubMatrixEntry, WeatherConditions } from '../models';
import { adjustForInclination, adjustCarryForWeather } from '../adjustments';

export interface RecommendationInput {
  /** Distancia real al objetivo (unidad del perfil). */
  targetDistance: number;
  /** Desnivel hasta el objetivo: + cuesta arriba, - cuesta abajo. */
  elevationChange: number;
  /** Condiciones meteo actuales. */
  currentWeather: WeatherConditions;
  /** Matriz de palos del jugador. */
  matrix: ClubMatrix;
}

export interface Recommendation {
  /** Palo recomendado. */
  club: ClubMatrixEntry;
  /** Carry estimado HOY del palo recomendado. */
  adjustedCarry: number;
  /** Objetivo tras aplicar la inclinación. */
  effectiveTarget: number;
  /** adjustedCarry - effectiveTarget (con signo): + pasa, - se queda corto. */
  deltaToTarget: number;
}

/**
 * Recomienda el palo cuyo carry de hoy se acerca más al objetivo efectivo.
 * Devuelve null si la matriz no tiene palos. Empate -> primer palo en orden.
 */
export function recommendClub(input: RecommendationInput): Recommendation | null {
  const { targetDistance, elevationChange, currentWeather, matrix } = input;
  if (matrix.entries.length === 0) {
    return null;
  }

  const effectiveTarget = adjustForInclination(targetDistance, elevationChange);

  let best: Recommendation | null = null;
  for (const club of matrix.entries) {
    const adjustedCarry = adjustCarryForWeather(
      club.carryDistance,
      matrix.baseline,
      currentWeather,
    );
    const deltaToTarget = adjustedCarry - effectiveTarget;
    if (best === null || Math.abs(deltaToTarget) < Math.abs(best.deltaToTarget)) {
      best = { club, adjustedCarry, effectiveTarget, deltaToTarget };
    }
  }

  return best;
}
