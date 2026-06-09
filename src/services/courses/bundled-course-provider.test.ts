import { Course } from '../../domain';
import { BundledCourseProvider } from './bundled-course-provider';
import { CourseRegistry } from './course-registry';
import { CourseSummary } from './course-provider';

const valderrama: CourseSummary = {
  id: 'osm-way-1',
  name: 'Club de Golf Valderrama',
  location: { lat: 36.28, lng: -5.29 },
  holeCount: 18,
};
const laCanada: CourseSummary = {
  id: 'osm-way-2',
  name: 'La Cañada Golf',
  location: { lat: 36.29, lng: -5.27 },
  holeCount: 18,
};

const fullValderrama: Course = {
  id: 'osm-way-1',
  name: 'Club de Golf Valderrama',
  source: 'osm',
  location: { lat: 36.28, lng: -5.29 },
  holeCount: 1,
  holes: [{ ref: 1, green: { center: { lat: 36.28, lng: -5.29 } }, tees: [], playLine: [] }],
  attribution: '© OpenStreetMap contributors (ODbL 1.0)',
};

const registry: CourseRegistry = {
  index: [valderrama, laCanada],
  load: (id) => (id === 'osm-way-1' ? fullValderrama : null),
};

describe('BundledCourseProvider.search', () => {
  const provider = new BundledCourseProvider(registry);

  it('devuelve lista vacía con query vacía (no lista todo)', async () => {
    expect(await provider.search('')).toEqual([]);
    expect(await provider.search('   ')).toEqual([]);
  });

  it('encuentra por substring del nombre', async () => {
    const r = await provider.search('valder');
    expect(r).toEqual([valderrama]);
  });

  it('ignora mayúsculas y acentos', async () => {
    const r = await provider.search('canada');
    expect(r).toEqual([laCanada]);
  });

  it('devuelve vacío si no hay coincidencias', async () => {
    expect(await provider.search('pebble')).toEqual([]);
  });
});

describe('BundledCourseProvider.getCourse', () => {
  const provider = new BundledCourseProvider(registry);

  it('carga el campo completo por id', async () => {
    expect(await provider.getCourse('osm-way-1')).toEqual(fullValderrama);
  });

  it('devuelve null si el id no está empaquetado', async () => {
    expect(await provider.getCourse('osm-way-999')).toBeNull();
  });
});
