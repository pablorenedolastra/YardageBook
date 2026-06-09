# Plan — Incremento 6: Juego · Selección de campo (datos reales OSM)

**Fecha:** 2026-06-09 · **Rama:** `feat/inc6-course-selection`
**Specs:** [`courses-provider-osm`](../specs/2026-06-05-courses-provider-osm.md) (§3, §4, §9),
[`ux-screens`](../specs/2026-06-03-yardagebook-ux-screens.md) (§5.7, §7, §8).

## Objetivo

Pantalla de **Juego · Selección de campo** funcionando en preview web, alimentada
por **datos reales de OpenStreetMap** empaquetados (offline-first), no mock:
buscador con autocomplete + lista de resultados + sección "Recientes". Al elegir
un campo se guarda en recientes y se navega a un placeholder del Hoyo 1 (el mapa
real es el Inc.7, que requiere dev build).

## Decisiones de diseño (derivadas del spec, sin re-litigar)

- **Empaquetado estático.** El proveedor MVP lee del bundle. Metro no permite
  `require()` dinámico por ruta, así que el script batch genera **un registro
  estático** (`assets/courses/registry.ts`) con un mapa `id → require('./<id>.json')`
  + el índice. `BundledCourseProvider` recibe ese registro por inyección → testeable
  sin ficheros y seguro en web.
- **Bundle completo desde el día 1** (incluye `polygon`/`playLine`): spec §10 lo
  recomienda (sigue siendo pequeño) para no re-fetchear al dibujar el green en Inc.7.
- **Región piloto:** Costa del Sol / Sotogrande (densa y bien mapeada en OSM;
  Valderrama ya validado en el spec). Objetivo 5–10 campos con `holeCount` razonable.
- **Recientes:** lista de `CourseSummary` en `AppRepository` bajo
  `yardagebook:course-history`, tope 8, dedup por `id`, más reciente al frente.
  La lógica de inserción es **pura y con TDD** (`addRecentCourse`).
- **Navegación al elegir:** ruta placeholder `app/game/[courseId].tsx` (Stack raíz,
  se apila sobre las tabs). Muestra nombre del campo + "Hoyo 1 · mapa en el Inc.7".
  Mantiene el flujo visible en web y prepara el Inc.7 sin construirlo.
- **Contrato `CourseProvider` intacto** (spec §3): no se toca para no romper el Inc.7.

## Trabajo (en orden, cada bloque verificable)

### 1. Servicio `src/services/courses/` (TDD en lo puro)
- `course-provider.ts` — `CourseSummary`, `CourseProvider` (copiados literal del spec §3).
- `course-registry.ts` — `CourseRegistry { index: CourseSummary[]; load(id): Course | null }`.
- `bundled-course-provider.ts` — `BundledCourseProvider implements CourseProvider`,
  constructor `(registry: CourseRegistry)`:
  - `search(query)`: normaliza (acentos + minúsculas, reusar patrón de `country-picker`),
    filtra `index` por substring; query vacía → `[]` (el autocomplete no lista todo).
  - `getCourse(id)`: `registry.load(id)`.
- `recents.ts` — `addRecentCourse(history, summary, max=8): CourseSummary[]` (pura).
- `normalize.ts` o reuso — función para quitar acentos/caso (si no hay una compartida).
- `index.ts` barrel + `createBundledCourseProvider()` que usa el registro generado.
- Tests: `bundled-course-provider.test.ts` (search match/no-match/acentos/query vacía;
  getCourse hit/miss) con un registro en memoria; `recents.test.ts` (dedup, orden, tope).

### 2. Script batch `scripts/fetch-courses.mjs`
- Añadir modo `--batch <targets.json>` (o lista embebida `--region`) que:
  - recorre una lista de `{ name | osmWay, slug }`,
  - por cada uno: query Overpass + `transform` (ya existen) → escribe
    `assets/courses/<id>.json`,
  - acumula `CourseSummary` (`id,name,location,holeCount`) → escribe
    `assets/courses/index.json`,
  - genera `assets/courses/registry.ts` (AUTO-GENERATED): import del index + mapa
    estático `require('./<id>.json')`.
  - rate-limit cortés entre campos (delay) y failover de mirrors ya existente.
- No romper el modo `--name/--osm-way/--out` actual. Exports nuevos testeables si aplica.

### 3. Datos piloto
- Lista curada de campos Costa del Sol / Sotogrande.
- Ejecutar el batch → `assets/courses/*.json` + `index.json` + `registry.ts`.
- Validar `holeCount` por campo; descartar los muy incompletos. Objetivo 5–10 buenos.
- Si Overpass falla por red en este entorno, documentarlo y dejar el pipeline listo.

### 4. `AppRepository` (TDD)
- `loadCourseHistory(): Promise<CourseSummary[]>` (default `[]`).
- `saveCourseHistory(list: CourseSummary[]): Promise<void>`.
- Key `yardagebook:course-history`. Tests con `InMemoryStore` (round-trip + default vacío).

### 5. Pantalla selección (`app/(tabs)/index.tsx`) + componentes
- Componentes en `src/ui/components/`:
  - `search-autocomplete.tsx` — input (estilo `TextField`) + render de resultados;
    props: `query`, `onChangeQuery`, `results`, `onSelect`. Smoke test.
  - `course-list-item.tsx` — fila: nombre + "{holeCount} hoyos". `onPress`. Smoke test.
- Pantalla (mantiene patrón `AppBackground` + `ScrollView`, `useFocusEffect` para
  cargar recientes, igual que `yardage-book.tsx`):
  - Título "Juego".
  - `SearchAutocomplete` sobre `provider.search(query)` (estado local async).
  - Sección "Recientes" (de `loadCourseHistory`) cuando la query está vacía.
  - `onSelect(course)` → `addRecentCourse` + `saveCourseHistory` + `router.push` al
    placeholder del hoyo.
- `app/game/[courseId].tsx` — placeholder Hoyo 1 en `AppBackground` (nombre del campo
  vía `getCourse` + nota "mapa en el Inc.7"). Smoke test ligero o no, según ROI.

### 6. Verificación + cierre
- `npm run typecheck && npm run lint && npm test`
- `npx expo export --platform web`
- Actualizar `docs/PROGRESS.md` (Inc.6 ✅, arreglar enlace al spec design-system movido).
- PR → merge.

## Riesgos / notas
- **Red en este entorno:** el fetch real a Overpass puede no estar disponible. Mitigación:
  el código del servicio y la UI no dependen de tener datos reales (registro inyectable);
  si el batch no puede ejecutarse, se entrega el pipeline + un set mínimo y se anota.
- **`registry.ts` generado:** se commitea (artefacto reproducible). Cabecera AUTO-GENERATED.
- **Atribución ODbL:** cada `Course.attribution` ya lo trae; se mostrará en el mapa (Inc.7).
  En Inc.6 no hay mapa, no es bloqueante aquí.
