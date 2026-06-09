import { Course } from '../../domain';

/** Resumen de campo para listas/búsqueda, sin cargar toda la geometría. */
export interface CourseSummary {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  holeCount: number;
}

/** Proveedor de campos. La impl. MVP lee de assets/courses/ (offline). */
export interface CourseProvider {
  /** Busca campos por texto (nombre). Para la pantalla de selección. */
  search(query: string): Promise<CourseSummary[]>;
  /** Carga un campo completo con geometría por id. */
  getCourse(id: string): Promise<Course | null>;
}
