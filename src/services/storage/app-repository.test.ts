import { AppRepository } from './app-repository';
import { InMemoryStore } from './in-memory-store';
import { Profile, ClubMatrix } from '../../domain';
import type { CourseSummary } from '../courses/course-provider';

const profile: Profile = {
  id: 'p1',
  firstName: 'Pablo',
  lastName: 'Renedo',
  email: 'pablo@example.com',
  country: 'ES',
  handicap: 12.4,
  unit: 'meters',
};
const matrix: ClubMatrix = {
  measuredContext: { month: 6, city: 'Madrid' },
  entries: [{ clubId: '7i', label: 'Hierro 7', carryDistance: 150, order: 1 }],
};

describe('AppRepository', () => {
  it('devuelve null cuando no hay perfil guardado', async () => {
    const repo = new AppRepository(new InMemoryStore());
    expect(await repo.loadProfile()).toBeNull();
  });

  it('guarda y recupera el perfil', async () => {
    const repo = new AppRepository(new InMemoryStore());
    await repo.saveProfile(profile);
    expect(await repo.loadProfile()).toEqual(profile);
  });

  it('devuelve null cuando no hay matriz guardada', async () => {
    const repo = new AppRepository(new InMemoryStore());
    expect(await repo.loadMatrix()).toBeNull();
  });

  it('guarda y recupera la matriz de palos', async () => {
    const repo = new AppRepository(new InMemoryStore());
    await repo.saveMatrix(matrix);
    expect(await repo.loadMatrix()).toEqual(matrix);
  });

  it('devuelve historial de campos vacío cuando no hay nada guardado', async () => {
    const repo = new AppRepository(new InMemoryStore());
    expect(await repo.loadCourseHistory()).toEqual([]);
  });

  it('guarda y recupera el historial de campos', async () => {
    const repo = new AppRepository(new InMemoryStore());
    const history: CourseSummary[] = [
      { id: 'osm-way-1', name: 'Las Brisas', location: { lat: 36.5, lng: -4.9 }, holeCount: 18 },
    ];
    await repo.saveCourseHistory(history);
    expect(await repo.loadCourseHistory()).toEqual(history);
  });
});
