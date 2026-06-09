import { Profile, ClubMatrix } from '../../domain';
import type { CourseSummary } from '../courses/course-provider';
import { KeyValueStore } from './key-value-store';

const PROFILE_KEY = 'yardagebook:profile';
const MATRIX_KEY = 'yardagebook:club-matrix';
const COURSE_HISTORY_KEY = 'yardagebook:course-history';

/** Persiste y recupera los datos de la app (perfil y matriz) sobre un KeyValueStore. */
export class AppRepository {
  constructor(private readonly store: KeyValueStore) {}

  async loadProfile(): Promise<Profile | null> {
    return this.read<Profile>(PROFILE_KEY);
  }

  async saveProfile(profile: Profile): Promise<void> {
    await this.store.set(PROFILE_KEY, JSON.stringify(profile));
  }

  async loadMatrix(): Promise<ClubMatrix | null> {
    return this.read<ClubMatrix>(MATRIX_KEY);
  }

  async saveMatrix(matrix: ClubMatrix): Promise<void> {
    await this.store.set(MATRIX_KEY, JSON.stringify(matrix));
  }

  async loadCourseHistory(): Promise<CourseSummary[]> {
    return (await this.read<CourseSummary[]>(COURSE_HISTORY_KEY)) ?? [];
  }

  async saveCourseHistory(history: CourseSummary[]): Promise<void> {
    await this.store.set(COURSE_HISTORY_KEY, JSON.stringify(history));
  }

  private async read<T>(key: string): Promise<T | null> {
    const raw = await this.store.get(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }
}
