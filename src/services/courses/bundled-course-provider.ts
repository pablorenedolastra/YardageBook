import { Course } from '../../domain';
import { CourseProvider, CourseSummary } from './course-provider';
import { CourseRegistry } from './course-registry';

/** Normaliza para búsqueda: minúsculas y sin acentos. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Proveedor MVP que lee de un registro estático empaquetado (offline-first). */
export class BundledCourseProvider implements CourseProvider {
  constructor(private readonly registry: CourseRegistry) {}

  async search(query: string): Promise<CourseSummary[]> {
    const q = normalize(query.trim());
    if (!q) return [];
    return this.registry.index.filter((c) => normalize(c.name).includes(q));
  }

  async getCourse(id: string): Promise<Course | null> {
    return this.registry.load(id);
  }
}
