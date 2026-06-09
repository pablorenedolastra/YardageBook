import { Course } from '../../domain';
import { CourseSummary } from './course-provider';

/**
 * Registro estático de campos empaquetados. Metro no permite `require()` por
 * ruta dinámica, así que el script batch genera una implementación concreta
 * (assets/courses/registry.ts) con el índice + un mapa estático id → JSON.
 */
export interface CourseRegistry {
  /** Índice de resúmenes para búsqueda/listado. */
  index: CourseSummary[];
  /** Carga el campo completo por id, o null si no está empaquetado. */
  load(id: string): Course | null;
}
