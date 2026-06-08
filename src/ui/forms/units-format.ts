import { DistanceUnit } from '../../domain';

/** Sufijo corto de la unidad para mostrar junto a distancias. */
export function unitLabel(unit: DistanceUnit): string {
  return unit === 'meters' ? 'm' : 'yd';
}
