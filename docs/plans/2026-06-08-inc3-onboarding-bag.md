# YardageBook UX — Incremento 3: BagEditor + Onboarding Paso 2 + ClubMatrix + persistencia

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** Cerrar el onboarding de punta a punta: editor de bolsa reutilizable (`BagEditor` + `ClubPickerSheet`), modelo `ClubMatrix` con `measuredContext {month, city}` (sustituye `baseline`), y persistencia de **Profile + ClubMatrix** al terminar el Paso 2 → entra a las pestañas.

**Architecture:** Cambio de modelo en `domain` + adaptación del motor (la meteo pasa a entrada **opcional** de `recommendClub`, gobernada por Plays Like; la firma de `adjustCarryForWeather` no cambia). Lógica de bolsa como funciones puras testeables en `src/ui/forms/bag-form.ts`. `BagEditor` controlado por un `BagDraft`. Persistencia vía `AppRepository` (ya existe). Tras guardar, `router.replace('/(tabs)')`.

**Refs:** UX §5.2/§5.4/§5.5/§7 · provider spec (Plays Like) · design system §8.

---

## Task 1: Modelo ClubMatrix + motor (meteo opcional)

- **club-matrix.ts:** `MeasuredContext { month: 1-12, city: string }`; `ClubMatrix { measuredContext, entries }` (quita `baseline`). `ClubMatrixEntry` igual.
- **recommend.ts:** `RecommendationInput` gana `baselineWeather?` y `currentWeather?` y `elevationChange?` (default 0). Si faltan ambas meteo → `adjustedCarry = club.carryDistance` (Plays Like OFF). Si están → `adjustCarryForWeather`. Quita el uso de `matrix.baseline`.
- **recommend.test.ts:** matriz con `measuredContext`; casos: selección sin meteo (OFF), uphill, vacío→null, y un caso con `baselineWeather`+`currentWeather` (ON) que escala el carry.
- **app-repository.test.ts:** fixture de matriz con `measuredContext: { month: 6, city: 'Madrid' }`.
- Verificar `npm test` (dominio + storage) + typecheck. Commit `feat(domain): ClubMatrix measuredContext + optional weather in engine`.

## Task 2: Catálogo de palos (`src/ui/forms/clubs.ts`)

Constante `CLUB_CATALOG: { clubId, label, group, order }[]` con grupos del spec §5.5: Maderas (driver, 3w, 5w), Híbridos (3h,4h,5h), Hierros (4i–9i), Wedges (pw,gw,sw,lw). `order` ascendente driver→wedges. Helpers `clubsByGroup()`. Commit `feat(forms): add club catalog`.

## Task 3: Lógica de bolsa pura (TDD) — `src/ui/forms/bag-form.ts`

Tipos `BagEntryDraft { clubId, label, distance: string, order }`, `BagDraft { entries, month, city }`. Funciones puras:
- `emptyBag(month, city?)`, `addClubToBag`, `addCustomToBag`, `removeFromBag(clubId)`, `setDistance(clubId, text)`, `sortByCatalogOrder`.
- `validateBag(draft)` → ok si ≥1 entrada con distancia > 0; sin clubId duplicado; distancias numéricas > 0.
- `isBagValid(draft)`, `toClubMatrix(draft)` (parsea distancias coma/punto, ordena, construye `ClubMatrix`).
Tests exhaustivos. Commit `feat(forms): add bag draft logic`.

## Task 4: Componentes — MonthPicker, ClubPickerSheet, BagEditor

- `MonthPicker`: modal con los 12 meses (es). 
- `ClubPickerSheet`: modal inferior con catálogo agrupado; `+` para añadir; añadidos muestran "Añadido ✓"; acceso a "+ Palo personalizado".
- `BagEditor` (controlado por `BagDraft` + onChange): filas editables (label + `NumberField` distancia + ✕), "+ Añadir palo", "+ Personalizado", selector de mes + ciudad. Tests de humo. Commit `feat(ui): add BagEditor, ClubPickerSheet, MonthPicker`.

## Task 5: Onboarding Paso 2 + persistencia

- `app/onboarding/bag.tsx` (reemplaza placeholder): usa `BagEditor` (vacío), botón **"Empezar a jugar"** (habilitado con bolsa válida). Al confirmar: genera `Profile` (draft del contexto + id) y `ClubMatrix` (`toClubMatrix`), `createAppRepository().saveProfile` + `saveMatrix`, y `router.replace('/(tabs)')`. Si no hay draft (entra directo a /onboarding/bag), redirige a Paso 1.
- `createId()` helper (`src/services/storage` o util) para `Profile.id`.
- Commit `feat(onboarding): bag step persists profile + matrix and enters app`.

## Task 6: Verificación

typecheck + lint + test + `expo export --platform web`. Commit final si procede. PR.

---

## Definición de "hecho"
- [ ] `ClubMatrix` con `measuredContext`; motor con meteo opcional; tests verdes.
- [ ] Lógica de bolsa pura testeada.
- [ ] Onboarding Paso 2 funcional: añadir/quitar palos, distancias, mes/ciudad; "Empezar a jugar" persiste y entra a pestañas.
- [ ] Reabrir la app con perfil guardado → va directo a pestañas (gating).
- [ ] typecheck/lint/test verdes; export web sin errores.

## Fuera de alcance
- Yardage Book ver/editar (Inc.4, reutiliza BagEditor).
- Plays Like real / meteo en vivo (Inc.7).
