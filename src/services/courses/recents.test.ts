import { addRecentCourse } from './recents';
import { CourseSummary } from './course-provider';

const c = (id: string): CourseSummary => ({
  id,
  name: `Campo ${id}`,
  location: { lat: 0, lng: 0 },
  holeCount: 18,
});

describe('addRecentCourse', () => {
  it('añade el campo al frente de un historial vacío', () => {
    expect(addRecentCourse([], c('a'))).toEqual([c('a')]);
  });

  it('pone el más reciente primero', () => {
    expect(addRecentCourse([c('a')], c('b'))).toEqual([c('b'), c('a')]);
  });

  it('deduplica por id (mueve al frente sin duplicar)', () => {
    expect(addRecentCourse([c('a'), c('b')], c('b'))).toEqual([c('b'), c('a')]);
  });

  it('recorta al máximo indicado', () => {
    const history = [c('a'), c('b'), c('c')];
    expect(addRecentCourse(history, c('d'), 3)).toEqual([c('d'), c('a'), c('b')]);
  });
});
