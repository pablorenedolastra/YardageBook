import { WeatherConditions } from '../models';

/** Fracción de carry ganada por cada °C por encima de la temperatura base. */
export const TEMP_FACTOR_PER_C = 0.0012;
/** Fracción de carry ganada por cada punto de % de humedad por encima de la base. */
export const HUMIDITY_FACTOR_PER_PCT = 0.0002;

/**
 * Ajusta el carry medido de un palo a las condiciones meteo actuales,
 * relativo a las condiciones en que se midió (baseline).
 * @param baselineCarry carry medido en las condiciones base
 * @param baseline condiciones en que se midió la matriz
 * @param current condiciones meteo actuales
 * @returns carry estimado HOY
 */
export function adjustCarryForWeather(
  baselineCarry: number,
  baseline: WeatherConditions,
  current: WeatherConditions,
): number {
  const tempDelta = current.temperatureC - baseline.temperatureC;
  const humidityDelta = current.humidityPct - baseline.humidityPct;
  const factor = 1 + tempDelta * TEMP_FACTOR_PER_C + humidityDelta * HUMIDITY_FACTOR_PER_PCT;
  return baselineCarry * factor;
}
