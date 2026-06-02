# YardageBook Tier 1 — Plan 1: Cimientos + Núcleo de Dominio

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Montar el proyecto Expo + TypeScript con tooling de tests/calidad, y construir el cerebro de la app (modelos + motor de recomendación de palo) como TypeScript puro y 100% testeado, sin UI todavía.

**Architecture:** Arquitectura en capas. Este plan entrega la capa `domain/` (TypeScript puro, sin React ni dependencias de móvil) y el andamiaje del proyecto. El dominio nunca importa de `ui/` ni de `services/`. Toda la lógica de recomendación se valida con tests unitarios que corren en milisegundos sin emulador.

**Tech Stack:** React Native + Expo (SDK más reciente), TypeScript estricto, Jest (preset `jest-expo`), ESLint (`eslint-config-expo`) + Prettier.

---

## Contexto para quien ejecuta

El repo ya existe con esta estructura (no la recrees):

```
YardageBook/
├── docs/specs/2026-06-02-yardagebook-design.md   ← diseño aprobado (léelo)
├── docs/plans/                                    ← este plan vive aquí
├── README.md                                      ← ya escrito, NO sobrescribir
├── .gitignore                                     ← ya escrito (Expo), NO sobrescribir
└── .git/                                          ← repo inicializado, rama main, remoto origin en GitHub
```

La ruta absoluta del repo es `/Users/parenedo/Claude PRL/YardageBook` (ojo: tiene un espacio, usa comillas en bash).

**El modelo físico de los coeficientes** (temperatura, humedad, inclinación) usa valores por defecto razonables y **parametrizables** (constantes exportadas). No son definitivos: son un punto de partida defendible que el usuario afinará con experiencia real. Eso es intencional, no un placeholder.

---

## Estructura de ficheros que crea este plan

```
src/domain/
├── models/
│   ├── units.ts          ← DistanceUnit
│   ├── profile.ts        ← Profile
│   ├── weather.ts        ← WeatherConditions
│   ├── club-matrix.ts    ← ClubMatrixEntry, ClubMatrix
│   └── index.ts          ← barrel
├── adjustments/
│   ├── inclination.ts    ← adjustForInclination()
│   ├── inclination.test.ts
│   ├── weather.ts        ← adjustCarryForWeather()
│   ├── weather.test.ts
│   └── index.ts          ← barrel
├── recommendation/
│   ├── recommend.ts      ← recommendClub()
│   ├── recommend.test.ts
│   └── index.ts          ← barrel
└── index.ts              ← barrel raíz del dominio
```

Más ficheros de configuración en la raíz (Tasks 1-3): `package.json`, `tsconfig.json`, `jest.config.js`, config de ESLint/Prettier.

---

## Task 1: Scaffolding del proyecto Expo + TypeScript

**Files:**

- Create: todo el andamiaje de Expo (App, package.json, app.json, babel.config.js, tsconfig.json) dentro del repo, **sin** tocar `README.md`, `.gitignore`, `.git`, ni `docs/`.

- [ ] **Step 1: Generar el proyecto Expo en un directorio temporal**

Se genera fuera para no chocar con los ficheros que ya existen, y luego se copia dentro.

Run:

```bash
cd "/Users/parenedo/Claude PRL" && npx create-expo-app@latest yb-scaffold --template blank-typescript
```

Expected: crea `/Users/parenedo/Claude PRL/yb-scaffold` con un proyecto Expo TS mínimo (App.tsx, package.json, app.json, tsconfig.json, babel.config.js) y termina con "Your project is ready!".

- [ ] **Step 2: Copiar el andamiaje al repo sin pisar lo existente**

Run:

```bash
cd "/Users/parenedo/Claude PRL" && rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'README.md' \
  --exclude '.gitignore' \
  yb-scaffold/ "YardageBook/" && rm -rf yb-scaffold
```

Expected: el comando termina sin error. `yb-scaffold` desaparece. Ahora `YardageBook/` contiene `App.tsx`, `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, etc.

- [ ] **Step 3: Instalar dependencias**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm install
```

Expected: se crea `node_modules/` y `package-lock.json`. Termina sin errores.

- [ ] **Step 4: Verificar que el proyecto compila TypeScript**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx tsc --noEmit
```

Expected: sin salida (exit code 0) = no hay errores de tipos.

- [ ] **Step 5: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "chore: scaffold Expo + TypeScript project"
```

---

## Task 2: Configurar Jest (preset jest-expo)

**Files:**

- Create: `jest.config.js`
- Modify: `package.json` (añadir scripts y devDependencies)
- Create: `src/domain/smoke.test.ts` (test de humo temporal para validar que Jest corre)

- [ ] **Step 1: Instalar dependencias de test**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm install --save-dev jest-expo jest @types/jest
```

Expected: termina sin errores; aparecen en `devDependencies` de `package.json`.

- [ ] **Step 2: Crear `jest.config.js`**

```js
module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};
```

- [ ] **Step 3: Añadir scripts a `package.json`**

En el objeto `"scripts"` de `package.json`, añade estas tres entradas (junto a las que ya genera Expo, sin borrar las existentes):

```json
"test": "jest",
"typecheck": "tsc --noEmit",
"lint": "expo lint"
```

- [ ] **Step 4: Escribir un test de humo**

Create `src/domain/smoke.test.ts`:

```ts
describe('jest setup', () => {
  it('runs a trivial test', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Ejecutar los tests y verificar que pasan**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm test
```

Expected: PASS, 1 test pasado en `src/domain/smoke.test.ts`.

- [ ] **Step 6: Borrar el test de humo**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && rm src/domain/smoke.test.ts
```

- [ ] **Step 7: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "chore: configure Jest with jest-expo preset"
```

---

## Task 3: Configurar ESLint + Prettier + TypeScript estricto

**Files:**

- Create/Modify: config de ESLint (`eslint.config.js` que genera `expo lint`)
- Create: `.prettierrc.json`
- Modify: `tsconfig.json` (asegurar `strict: true`)
- Modify: `package.json` (script `format`)

- [ ] **Step 1: Inicializar ESLint de Expo**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx expo lint
```

Expected: la primera vez pregunta si instalar `eslint` y `eslint-config-expo`; acepta. Crea el fichero de config de ESLint y ejecuta el linter (sin errores sobre el código actual).

- [ ] **Step 2: Instalar Prettier**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm install --save-dev prettier
```

- [ ] **Step 3: Crear `.prettierrc.json`**

```json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

- [ ] **Step 4: Asegurar TypeScript estricto en `tsconfig.json`**

Abre `tsconfig.json`. Debe extender la base de Expo y tener `strict: true`. Si no está, déjalo así:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

- [ ] **Step 5: Añadir script `format` a `package.json`**

En `"scripts"`:

```json
"format": "prettier --write ."
```

- [ ] **Step 6: Formatear y verificar lint + typecheck**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm run format && npm run lint && npm run typecheck
```

Expected: Prettier reformatea ficheros; lint sin errores; typecheck sin salida (exit 0).

- [ ] **Step 7: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "chore: add ESLint, Prettier and strict TypeScript"
```

---

## Task 4: Modelos del dominio (tipos)

Tipos puros, sin lógica en tiempo de ejecución. Se validan con `typecheck` y al ser importados por los tests de las Tasks 5-7.

**Files:**

- Create: `src/domain/models/units.ts`
- Create: `src/domain/models/profile.ts`
- Create: `src/domain/models/weather.ts`
- Create: `src/domain/models/club-matrix.ts`
- Create: `src/domain/models/index.ts`

- [ ] **Step 1: Crear `src/domain/models/units.ts`**

```ts
/** Unidad de distancia en la que el usuario introduce y ve las distancias. */
export type DistanceUnit = 'meters' | 'yards';
```

- [ ] **Step 2: Crear `src/domain/models/profile.ts`**

```ts
import { DistanceUnit } from './units';

/** Perfil del jugador. Vive solo en el dispositivo. */
export interface Profile {
  id: string;
  name: string;
  /** Unidad en la que se expresan todas las distancias del perfil. */
  unit: DistanceUnit;
}
```

- [ ] **Step 3: Crear `src/domain/models/weather.ts`**

```ts
/** Condiciones meteo relevantes para el vuelo de la bola (v1: temp + humedad). */
export interface WeatherConditions {
  /** Temperatura en grados Celsius. */
  temperatureC: number;
  /** Humedad relativa en porcentaje, 0-100. */
  humidityPct: number;
}
```

- [ ] **Step 4: Crear `src/domain/models/club-matrix.ts`**

```ts
import { WeatherConditions } from './weather';

/** Una fila de la matriz de palos: un palo y su distancia de carry medida. */
export interface ClubMatrixEntry {
  /** Identificador estable del palo, ej. "7-iron", "PW", "driver". */
  clubId: string;
  /** Etiqueta visible para el usuario, ej. "Hierro 7". */
  label: string;
  /** Distancia de carry medida, en la unidad del perfil. */
  carryDistance: number;
  /** Orden de presentación (ascendente). */
  order: number;
}

/** Matriz de palos del jugador, con las condiciones base en que se midió. */
export interface ClubMatrix {
  /** Condiciones meteo en las que se midieron TODAS las distancias de la matriz. */
  baseline: WeatherConditions;
  entries: ClubMatrixEntry[];
}
```

- [ ] **Step 5: Crear `src/domain/models/index.ts` (barrel)**

```ts
export * from './units';
export * from './profile';
export * from './weather';
export * from './club-matrix';
```

- [ ] **Step 6: Verificar typecheck**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm run typecheck
```

Expected: sin salida (exit 0).

- [ ] **Step 7: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(domain): add core models (Profile, ClubMatrix, WeatherConditions)"
```

---

## Task 5: Ajuste por inclinación (TDD)

Función pura: la distancia efectiva al objetivo aumenta cuesta arriba y disminuye cuesta abajo. Modelo v1: metros efectivos = distancia + desnivel × factor. El desnivel se expresa en la misma unidad que la distancia (positivo = cuesta arriba, negativo = cuesta abajo).

**Files:**

- Create: `src/domain/adjustments/inclination.ts`
- Test: `src/domain/adjustments/inclination.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `src/domain/adjustments/inclination.test.ts`:

```ts
import { adjustForInclination } from './inclination';

describe('adjustForInclination', () => {
  it('no cambia la distancia en terreno llano', () => {
    expect(adjustForInclination(150, 0)).toBe(150);
  });

  it('suma metros cuesta arriba (desnivel positivo)', () => {
    expect(adjustForInclination(150, 5)).toBe(155);
  });

  it('resta metros cuesta abajo (desnivel negativo)', () => {
    expect(adjustForInclination(150, -8)).toBe(142);
  });
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/domain/adjustments/inclination.test.ts
```

Expected: FAIL — "Cannot find module './inclination'".

- [ ] **Step 3: Implementar el mínimo**

Create `src/domain/adjustments/inclination.ts`:

```ts
/**
 * Metros efectivos añadidos por cada metro de desnivel. Parametrizable;
 * 1.0 = "juega el desnivel tal cual" (regla de pulgar habitual en golf).
 */
export const INCLINATION_FACTOR = 1.0;

/**
 * Ajusta la distancia objetivo según el desnivel hasta el objetivo.
 * @param distance distancia real al objetivo (unidad del perfil)
 * @param elevationChange desnivel hasta el objetivo: positivo = cuesta arriba,
 *   negativo = cuesta abajo (misma unidad que distance)
 * @returns distancia efectiva que la bola debe recorrer
 */
export function adjustForInclination(distance: number, elevationChange: number): number {
  return distance + elevationChange * INCLINATION_FACTOR;
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/domain/adjustments/inclination.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(domain): add inclination adjustment"
```

---

## Task 6: Ajuste por meteo (TDD)

Función pura: el carry de un palo cambia con la densidad del aire. Aire más cálido y/o más húmedo es menos denso → la bola vuela más. El ajuste es la **diferencia** entre las condiciones de hoy y las condiciones base de la matriz. Modelo v1: factor lineal sobre el carry.

**Files:**

- Create: `src/domain/adjustments/weather.ts`
- Test: `src/domain/adjustments/weather.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `src/domain/adjustments/weather.test.ts`:

```ts
import { adjustCarryForWeather } from './weather';
import { WeatherConditions } from '../models';

const baseline: WeatherConditions = { temperatureC: 20, humidityPct: 50 };

describe('adjustCarryForWeather', () => {
  it('no cambia el carry si las condiciones son idénticas a la base', () => {
    const current: WeatherConditions = { temperatureC: 20, humidityPct: 50 };
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(150, 5);
  });

  it('aumenta el carry cuando hace más calor que en la base', () => {
    const current: WeatherConditions = { temperatureC: 30, humidityPct: 50 };
    // factor = 1 + (30-20)*0.0012 = 1.012 -> 151.8
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(151.8, 4);
  });

  it('aumenta el carry cuando hay más humedad que en la base', () => {
    const current: WeatherConditions = { temperatureC: 20, humidityPct: 80 };
    // factor = 1 + (80-50)*0.0002 = 1.006 -> 150.9
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(150.9, 4);
  });

  it('reduce el carry cuando hace más frío que en la base', () => {
    const current: WeatherConditions = { temperatureC: 10, humidityPct: 50 };
    // factor = 1 + (10-20)*0.0012 = 0.988 -> 148.2
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(148.2, 4);
  });
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/domain/adjustments/weather.test.ts
```

Expected: FAIL — "Cannot find module './weather'".

- [ ] **Step 3: Implementar el mínimo**

Create `src/domain/adjustments/weather.ts`:

```ts
import { WeatherConditions } from '../models';

/** Fracción de carry ganada por cada °C por encima de la temperatura base. */
export const TEMP_FACTOR_PER_C = 0.0012;
/** Fracción de carry ganada por cada punto de % de humedad por encima de la base. */
export const HUMIDITY_FACTOR_PER_PCT = 0.0002;

/**
 * Ajusta el carry medido de un palo a las condiciones meteo actuales,
 * relativo a las condiciones en que se midió (baseline).
 * @param baselineCarry carry medido en las condiciones base
 * @param baseline condiciones en que se midió la matriz
 * @param current condiciones meteo actuales
 * @returns carry estimado HOY
 */
export function adjustCarryForWeather(
  baselineCarry: number,
  baseline: WeatherConditions,
  current: WeatherConditions,
): number {
  const tempDelta = current.temperatureC - baseline.temperatureC;
  const humidityDelta = current.humidityPct - baseline.humidityPct;
  const factor = 1 + tempDelta * TEMP_FACTOR_PER_C + humidityDelta * HUMIDITY_FACTOR_PER_PCT;
  return baselineCarry * factor;
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/domain/adjustments/weather.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Crear `src/domain/adjustments/index.ts` (barrel)**

```ts
export * from './inclination';
export * from './weather';
```

- [ ] **Step 6: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(domain): add weather adjustment"
```

---

## Task 7: Motor de recomendación (TDD)

Función pura que combina los dos ajustes: calcula el objetivo efectivo (inclinación), normaliza el carry de cada palo a las condiciones de hoy (meteo) y elige el palo cuyo carry de hoy se acerca más al objetivo efectivo. Devuelve `null` si la matriz está vacía. En caso de empate, gana el primer palo en orden de lista.

**Files:**

- Create: `src/domain/recommendation/recommend.ts`
- Test: `src/domain/recommendation/recommend.test.ts`

- [ ] **Step 1: Escribir el test que falla**

Create `src/domain/recommendation/recommend.test.ts`:

```ts
import { recommendClub } from './recommend';
import { ClubMatrix } from '../models';

const matrix: ClubMatrix = {
  baseline: { temperatureC: 20, humidityPct: 50 },
  entries: [
    { clubId: 'pw', label: 'PW', carryDistance: 110, order: 1 },
    { clubId: '9i', label: 'Hierro 9', carryDistance: 125, order: 2 },
    { clubId: '8i', label: 'Hierro 8', carryDistance: 138, order: 3 },
    { clubId: '7i', label: 'Hierro 7', carryDistance: 150, order: 4 },
    { clubId: '6i', label: 'Hierro 6', carryDistance: 162, order: 5 },
  ],
};

describe('recommendClub', () => {
  it('elige el palo cuyo carry coincide con el objetivo (llano, meteo = base)', () => {
    const rec = recommendClub({
      targetDistance: 150,
      elevationChange: 0,
      currentWeather: { temperatureC: 20, humidityPct: 50 },
      matrix,
    });
    expect(rec?.club.clubId).toBe('7i');
    expect(rec?.effectiveTarget).toBe(150);
    expect(rec?.adjustedCarry).toBeCloseTo(150, 5);
  });

  it('sube de palo cuesta arriba (el objetivo efectivo crece)', () => {
    const rec = recommendClub({
      targetDistance: 150,
      elevationChange: 10, // objetivo efectivo = 160 -> más cerca del 6i (162)
      currentWeather: { temperatureC: 20, humidityPct: 50 },
      matrix,
    });
    expect(rec?.club.clubId).toBe('6i');
    expect(rec?.effectiveTarget).toBe(160);
  });

  it('devuelve null si la matriz no tiene palos', () => {
    const empty: ClubMatrix = { baseline: { temperatureC: 20, humidityPct: 50 }, entries: [] };
    const rec = recommendClub({
      targetDistance: 150,
      elevationChange: 0,
      currentWeather: { temperatureC: 20, humidityPct: 50 },
      matrix: empty,
    });
    expect(rec).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar el test y verificar que falla**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/domain/recommendation/recommend.test.ts
```

Expected: FAIL — "Cannot find module './recommend'".

- [ ] **Step 3: Implementar el mínimo**

Create `src/domain/recommendation/recommend.ts`:

```ts
import { ClubMatrix, ClubMatrixEntry, WeatherConditions } from '../models';
import { adjustForInclination, adjustCarryForWeather } from '../adjustments';

export interface RecommendationInput {
  /** Distancia real al objetivo (unidad del perfil). */
  targetDistance: number;
  /** Desnivel hasta el objetivo: + cuesta arriba, - cuesta abajo. */
  elevationChange: number;
  /** Condiciones meteo actuales. */
  currentWeather: WeatherConditions;
  /** Matriz de palos del jugador. */
  matrix: ClubMatrix;
}

export interface Recommendation {
  /** Palo recomendado. */
  club: ClubMatrixEntry;
  /** Carry estimado HOY del palo recomendado. */
  adjustedCarry: number;
  /** Objetivo tras aplicar la inclinación. */
  effectiveTarget: number;
  /** adjustedCarry - effectiveTarget (con signo): + pasa, - se queda corto. */
  deltaToTarget: number;
}

/**
 * Recomienda el palo cuyo carry de hoy se acerca más al objetivo efectivo.
 * Devuelve null si la matriz no tiene palos. Empate -> primer palo en orden.
 */
export function recommendClub(input: RecommendationInput): Recommendation | null {
  const { targetDistance, elevationChange, currentWeather, matrix } = input;
  if (matrix.entries.length === 0) {
    return null;
  }

  const effectiveTarget = adjustForInclination(targetDistance, elevationChange);

  let best: Recommendation | null = null;
  for (const club of matrix.entries) {
    const adjustedCarry = adjustCarryForWeather(
      club.carryDistance,
      matrix.baseline,
      currentWeather,
    );
    const deltaToTarget = adjustedCarry - effectiveTarget;
    if (best === null || Math.abs(deltaToTarget) < Math.abs(best.deltaToTarget)) {
      best = { club, adjustedCarry, effectiveTarget, deltaToTarget };
    }
  }

  return best;
}
```

- [ ] **Step 4: Ejecutar el test y verificar que pasa**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/domain/recommendation/recommend.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Crear `src/domain/recommendation/index.ts` (barrel)**

```ts
export * from './recommend';
```

- [ ] **Step 6: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(domain): add club recommendation engine"
```

---

## Task 8: Barrel raíz del dominio y verificación final

**Files:**

- Create: `src/domain/index.ts`

- [ ] **Step 1: Crear `src/domain/index.ts` (barrel raíz)**

```ts
export * from './models';
export * from './adjustments';
export * from './recommendation';
```

- [ ] **Step 2: Verificación completa (typecheck + lint + todos los tests)**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm run typecheck && npm run lint && npm test
```

Expected: typecheck exit 0; lint sin errores; Jest PASS con 10 tests (3 inclinación + 4 meteo + 3 recomendación).

- [ ] **Step 3: Commit**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git add -A && git commit -m "feat(domain): add domain barrel export"
```

- [ ] **Step 4: Push a GitHub**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && git push origin main
```

Expected: la rama main sube a `origin` (github.com/pablorenedolastra/YardageBook).

---

## Definición de "hecho" para este plan

- [ ] El proyecto Expo + TS arranca y compila (`npm run typecheck` limpio).
- [ ] `npm test` pasa con 10 tests verdes.
- [ ] `npm run lint` sin errores.
- [ ] La capa `src/domain/` no importa nada de React ni de Expo (solo TypeScript puro).
- [ ] Todo commiteado y subido a GitHub.

## Lo que este plan NO incluye (próximos planes)

- Persistencia local (storage) y pantallas de Perfil / Matriz → **Plan 2**.
- Hito de diseño UX de pantallas → antes del **Plan 3**.
- Entrada manual de distancia + pantalla de recomendación → **Plan 3**.
- Integración de meteo (API Open-Meteo) → **Plan 4**.
- GPS (mapa satélite + marcar punto) → **Plan 5**.
