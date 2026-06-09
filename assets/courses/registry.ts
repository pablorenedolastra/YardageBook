// AUTO-GENERATED por scripts/fetch-courses.mjs --batch. No editar a mano.
// Datos © OpenStreetMap contributors, ODbL 1.0.
import type { Course } from '../../src/domain';
import type { CourseRegistry } from '../../src/services/courses/course-registry';
import type { CourseSummary } from '../../src/services/courses/course-provider';
import index from './index.json';
import osm_way_237391513 from './osm-way-237391513.json';
import osm_way_97671239 from './osm-way-97671239.json';

const data: Record<string, Course> = {
  'osm-way-237391513': osm_way_237391513 as unknown as Course,
  'osm-way-97671239': osm_way_97671239 as unknown as Course,
};

/** Registro estático de campos empaquetados. */
export const courseRegistry: CourseRegistry = {
  index: index as CourseSummary[],
  load: (id) => data[id] ?? null,
};
