import { DistanceUnit } from '../../domain';

/** Metros que mide una yarda (factor de conversión exacto). */
const METERS_PER_YARD = 0.9144;

/** Sufijo corto de la unidad para mostrar junto a distancias. */
export function unitLabel(unit: DistanceUnit): string {
  return unit === 'meters' ? 'm' : 'yd';
}

/**
 * Convierte una distancia en metros (p. ej. de haversine) a la unidad del perfil.
 * La matriz de palos está en la unidad del perfil, así que hay que convertir antes
 * de pasar la distancia a `recommendClub` y antes de mostrarla.
 */
export function toUnitDistance(meters: number, unit: DistanceUnit): number {
  return unit === 'meters' ? meters : meters / METERS_PER_YARD;
}
