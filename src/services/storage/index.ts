import { AppRepository } from './app-repository';
import { AsyncStorageStore } from './async-storage-store';

export * from './key-value-store';
export * from './in-memory-store';
export * from './app-repository';
export * from './async-storage-store';

/** Crea el repositorio de la app respaldado por AsyncStorage (dispositivo). */
export function createAppRepository(): AppRepository {
  return new AppRepository(new AsyncStorageStore());
}
