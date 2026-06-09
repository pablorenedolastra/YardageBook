import { CourseSummary } from './course-provider';

/** Máximo de campos recientes que guardamos. */
export const MAX_RECENT_COURSES = 8;

/**
 * Inserta un campo al frente del historial de recientes: dedup por `id`, el más
 * reciente primero, recortado a `max`. Función pura (testeable sin almacenamiento).
 */
export function addRecentCourse(
  history: CourseSummary[],
  summary: CourseSummary,
  max: number = MAX_RECENT_COURSES,
): CourseSummary[] {
  const withoutDup = history.filter((c) => c.id !== summary.id);
  return [summary, ...withoutDup].slice(0, max);
}
