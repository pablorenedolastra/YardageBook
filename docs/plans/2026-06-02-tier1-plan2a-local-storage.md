# YardageBook Tier 1 — Plan 2A: Almacenamiento local

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development o superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persistir y recuperar el perfil del jugador y su matriz de palos en el dispositivo, con una capa testeable sin móvil.

**Architecture:** Patrón puerto + adaptador (ports & adapters). Un puerto `KeyValueStore` (interfaz de bajo nivel clave→valor) con dos implementaciones: `AsyncStorageStore` (respaldada por AsyncStorage, para el móvil) e `InMemoryStore` (para tests y desarrollo). Encima, `AppRepository` serializa/deserializa los objetos de dominio (`Profile`, `ClubMatrix`) como JSON. La capa `services/storage` puede importar de `domain` (nunca al revés). Los tests corren contra `InMemoryStore` (comportamiento real, sin mocks).

**Tech Stack:** `@react-native-async-storage/async-storage`, TypeScript estricto, Jest.

---

## Estructura de ficheros que crea este plan

```
src/services/storage/
├── key-value-store.ts        ← interfaz KeyValueStore (puerto)
├── in-memory-store.ts        ← InMemoryStore (implementación para tests/dev)
├── in-memory-store.test.ts
├── app-repository.ts         ← AppRepository: load/save Profile y ClubMatrix
├── app-repository.test.ts
├── async-storage-store.ts    ← AsyncStorageStore (adaptador AsyncStorage)
└── index.ts                  ← barrel
```

`services/storage` importa tipos de `src/domain` vía el barrel `../../domain`. Permitido (la regla es que `domain` no importe de `services`/`ui`, no al revés).

---

## Task 1: Puerto KeyValueStore + InMemoryStore (TDD)

**Files:**

- Create: `src/services/storage/key-value-store.ts`
- Create: `src/services/storage/in-memory-store.ts`
- Test: `src/services/storage/in-memory-store.test.ts`

- [ ] **Step 1: Instalar AsyncStorage** (lo usa el adaptador de la Task 3; se instala ya para no fragmentar)

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx expo install @react-native-async-storage/async-storage
```

Expected: añade la dependencia a `package.json` con la versión compatible con Expo SDK 56.

- [ ] **Step 2: Escribir el test que falla**

Create `src/services/storage/in-memory-store.test.ts`:

```ts
import { InMemoryStore } from './in-memory-store';

describe('InMemoryStore', () => {
  it('devuelve null para una clave inexistente', async () => {
    const store = new InMemoryStore();
    expect(await store.get('missing')).toBeNull();
  });

  it('guarda y recupera un valor', async () => {
    const store = new InMemoryStore();
    await store.set('k', 'v');
    expect(await store.get('k')).toBe('v');
  });

  it('elimina un valor', async () => {
    const store = new InMemoryStore();
    await store.set('k', 'v');
    await store.remove('k');
    expect(await store.get('k')).toBeNull();
  });
});
```

- [ ] **Step 3: Ejecutar y verificar que falla**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/services/storage/in-memory-store.test.ts
```

Expected: FAIL — "Cannot find module './in-memory-store'".

- [ ] **Step 4: Implementar el puerto**

Create `src/services/storage/key-value-store.ts`:

```ts
/** Almacén clave-valor de bajo nivel. Puerto (interfaz) para persistencia. */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
```

- [ ] **Step 5: Implementar InMemoryStore**

Create `src/services/storage/in-memory-store.ts`:

```ts
import { KeyValueStore } from './key-value-store';

/** Implementación en memoria de KeyValueStore. Para tests y desarrollo. */
export class InMemoryStore implements KeyValueStore {
  private readonly data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.has(key) ? (this.data.get(key) as string) : null;
  }

  async set(key: string, value: string): Promise<void> {
    this.data.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.data.delete(key);
  }
}
```

- [ ] **Step 6: Ejecutar y verificar que pasa**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/services/storage/in-memory-store.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(storage): add KeyValueStore port and InMemoryStore"
```

---

## Task 2: AppRepository (TDD contra InMemoryStore)

**Files:**

- Create: `src/services/storage/app-repository.ts`
- Test: `src/services/storage/app-repository.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `src/services/storage/app-repository.test.ts`:

```ts
import { AppRepository } from './app-repository';
import { InMemoryStore } from './in-memory-store';
import { Profile, ClubMatrix } from '../../domain';

const profile: Profile = { id: 'p1', name: 'Pablo', unit: 'meters' };
const matrix: ClubMatrix = {
  baseline: { temperatureC: 20, humidityPct: 50 },
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
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/services/storage/app-repository.test.ts
```

Expected: FAIL — "Cannot find module './app-repository'".

- [ ] **Step 3: Implementar AppRepository**

Create `src/services/storage/app-repository.ts`:

```ts
import { Profile, ClubMatrix } from '../../domain';
import { KeyValueStore } from './key-value-store';

const PROFILE_KEY = 'yardagebook:profile';
const MATRIX_KEY = 'yardagebook:club-matrix';

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

  private async read<T>(key: string): Promise<T | null> {
    const raw = await this.store.get(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  }
}
```

- [ ] **Step 4: Ejecutar y verificar que pasa**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/services/storage/app-repository.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(storage): add AppRepository for Profile and ClubMatrix persistence"
```

---

## Task 3: Adaptador AsyncStorage + barrel + verificación final

`AsyncStorageStore` es un adaptador fino sobre AsyncStorage. No se testea con Jest unitario (requiere entorno nativo); su lógica es una delegación directa. Los tests cubren el comportamiento real vía `InMemoryStore`.

**Files:**

- Create: `src/services/storage/async-storage-store.ts`
- Create: `src/services/storage/index.ts`

- [ ] **Step 1: Implementar el adaptador**

Create `src/services/storage/async-storage-store.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyValueStore } from './key-value-store';

/** Implementación de KeyValueStore respaldada por AsyncStorage (dispositivo). */
export class AsyncStorageStore implements KeyValueStore {
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
```

- [ ] **Step 2: Crear el barrel**

Create `src/services/storage/index.ts`:

```ts
export * from './key-value-store';
export * from './in-memory-store';
export * from './app-repository';
export * from './async-storage-store';
```

- [ ] **Step 3: Verificación completa**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm run typecheck && npm run lint && npm test
```

Expected: typecheck exit 0; lint sin errores; Jest PASS con 17 tests (10 dominio + 3 InMemoryStore + 4 AppRepository).

- [ ] **Step 4: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(storage): add AsyncStorage adapter and storage barrel"
```

---

## Definición de "hecho"

- [ ] `npm test` pasa con 17 tests verdes.
- [ ] `npm run typecheck` y `npm run lint` limpios.
- [ ] `AppRepository` persiste y recupera `Profile` y `ClubMatrix`; devuelve `null` si no hay nada guardado.
- [ ] `services/storage` importa de `domain`, nunca al revés.
- [ ] Todo commiteado.

## Lo que NO incluye (próximo)

- Pantallas de Perfil y Matriz (Plan 2B) — requiere diseño UX previo.
