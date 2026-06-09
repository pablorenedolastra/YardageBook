import { courseRegistry } from '../../../assets/courses/registry';
import { BundledCourseProvider } from './bundled-course-provider';
import { CourseProvider } from './course-provider';

export * from './course-provider';
export * from './course-registry';
export * from './bundled-course-provider';
export * from './recents';

/** Proveedor de campos por defecto: lee del registro empaquetado (offline). */
export function createCourseProvider(): CourseProvider {
  return new BundledCourseProvider(courseRegistry);
}
