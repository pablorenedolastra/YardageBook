# YardageBook — Estado del proyecto y guía para retomar

> **Última actualización:** 2026-06-09 · **Rama principal:** `main` (protegida) · **78 tests verdes**

Documento vivo de continuidad. Si retomas el proyecto (o empiezas una sesión
nueva), **lee esto primero**. Apunta a los specs y planes con el detalle.

---

## 1. Qué es YardageBook

App móvil de golf **local-first** (Expo / React Native), iPhone primero y Android
después. Es un **caddie de bolsillo**: dada una distancia (manual o tocando el
mapa) + inclinación + meteo, recomienda **qué palo usar** según la **matriz de
palos personal** del jugador. Sin servidor, sin cuentas, sin nube: todo en el
dispositivo. La meteo y los datos de campos son las únicas fuentes externas.

**Specs (fuente de verdad del diseño):**
- Producto v1: [`docs/specs/2026-06-02-yardagebook-design.md`](specs/2026-06-02-yardagebook-design.md)
- Sistema de diseño: [`docs/specs/2026-06-02-yardagebook-design-system.md`](specs/2026-06-02-yardagebook-design-system.md)
- Pantallas y flujos (manda sobre el de producto donde difieran): [`docs/specs/2026-06-03-yardagebook-ux-screens.md`](specs/2026-06-03-yardagebook-ux-screens.md)
- Proveedor de campos (OSM): [`docs/specs/2026-06-05-courses-provider-osm.md`](specs/2026-06-05-courses-provider-osm.md)

---

## 2. Stack y arquitectura

- **Expo SDK 56 + TypeScript estricto.** Navegación con **expo-router**.
- **Tabs a medida** (no nativas): `Tabs` de expo-router con `tabBar` propio
  (`src/ui/components/tab-bar.tsx`), para honrar el sistema de diseño y funcionar
  en preview web.
- **Sistema de diseño** (papel crema / oliva, Space Grotesk + Inter, iconos
  Feather de `@expo/vector-icons`, plano sin sombras, solo claro). Tokens en
  `src/ui/theme/` — **cero literales** fuera de ahí.
- **Capas** (regla de oro: `domain/` no importa de `services/` ni `ui/`):
  - `src/domain/` — TS puro, testeable sin móvil:
    - `models/` — units, profile, weather, club-matrix, geo, course
    - `adjustments/` — `adjustForInclination`, `adjustCarryForWeather`
    - `recommendation/` — `recommendClub` (meteo **opcional**, gobernada por "Plays Like")
    - `geo/` — `haversineMeters`
  - `src/services/` — `storage/` (puerto `KeyValueStore` + `InMemoryStore` +
    `AsyncStorageStore` + `AppRepository` + `createAppRepository`), `id.ts`
  - `src/ui/` — `theme/`, `components/`, `forms/` (lógica pura de formularios),
    `onboarding/` (contexto del draft)
  - `app/` — rutas expo-router (no co-locar componentes aquí):
    - `_layout.tsx` (Stack raíz), `index.tsx` (gating onboarding↔tabs)
    - `onboarding/` — `_layout` (Stack + OnboardingProvider), `index` (Paso 1
      perfil), `bag` (Paso 2 bolsa, persiste y entra a tabs)
    - `(tabs)/` — `_layout` (Tabs + TabBar), `index` (Juego), `yardage-book`, `profile`

**Importante (bug ya resuelto):** **cada pantalla envuelve su contenido en
`<AppBackground>`** (fondo papel opaco). NO poner un único AppBackground en el
layout raíz: en web las escenas inactivas del bottom-tabs quedan detrás y, si son
transparentes, se ven superpuestas. Mantén el patrón "AppBackground por pantalla".

---

## 3. Estado: hecho vs. pendiente

Pipeline seguido: dominio/almacenamiento primero, luego UI por incrementos del
orden del spec de pantallas (§10).

| # | Incremento | Estado | PR |
|---|-----------|--------|----|
| — | Cimientos + motor de recomendación (dominio puro, TDD) | ✅ | merged |
| — | Almacenamiento local (storage) | ✅ | merged |
| 1 | Shell de navegación (3 pestañas + gating onboarding) | ✅ | #3 |
| 2 | Formularios + Onboarding Paso 1 + modelo `Profile` | ✅ | #5 |
| 3 | BagEditor + ClubPickerSheet + Onboarding Paso 2 + `ClubMatrix` + persistencia | ✅ | #6 |
| 4 | Yardage Book (ver/editar) | ✅ | #7 |
| 5 | Perfil (pestaña ver/editar) | ✅ | #8 |
| 5.5 | Dominio de campos (`geo`/`course` + `haversineMeters`) | ✅ | #4 |
| — | Fix solapamiento de pantallas en web | ✅ | #9 |
| **6** | **Juego · Selección de campo** (servicio `courses` OSM real) | ⏳ siguiente | — |
| **7** | **Juego · Hoyo** (mapa, GPS, recomendación) — **requiere dev build** | ⏳ | — |

**Funciona hoy (preview web):** onboarding completo (perfil → bolsa → guardar →
entra a tabs), Yardage Book ver/editar, Perfil ver/editar (unidades cambian y
persisten), gating (reabrir con perfil → directo a tabs).

### Incremento 6 (siguiente) — tareas
Ver `docs/specs/2026-06-05-courses-provider-osm.md` §9. Resumen:
1. Servicio `src/services/courses/`: interfaz `CourseProvider` (`search`,
   `getCourse`) + `BundledCourseProvider` que lee de `assets/courses/` + mock para tests.
2. Extender `scripts/fetch-courses.mjs` a modo batch → genera `assets/courses/index.json` + JSON por campo.
3. Bajar 5-10 campos piloto (región densa: Costa del Sol / Valencia) a `assets/courses/`.
4. `AppRepository`: `loadCourseHistory`/`saveCourseHistory` (recientes).
5. Pantalla Selección de campo (`SearchAutocomplete` + `CourseListItem` + recientes). **Visible en web.**

### Incremento 7 — tareas (último; cambia el modo de ejecución)
- `react-native-maps` (satélite) + `expo-location` (GPS) → **development build**
  (no Expo Go ni web). `HoleMap`, `GpsMarker`, `TargetMarker` (onPress),
  `AimLine`+`DistanceChip` (haversine→`recommendClub`), `RecommendationBar`,
  `PlaysLikeToggle`, chip centro de green, `HoleNavBar`. **Atribución ODbL visible.**
- Decisiones abiertas: lógica fina de Plays Like ON (origen de desnivel/meteo).

---

## 4. Decisiones clave (no re-litigar sin motivo)

- **Local-first**, sin backend/cuentas/nube.
- **Recomendación**: distancia + inclinación + meteo (temp/humedad). La meteo solo
  se aplica con **Plays Like ON** (`recommendClub` recibe `baselineWeather`/
  `currentWeather` opcionales). Coeficientes parametrizables (constantes), a afinar
  con experiencia real.
- **`ClubMatrix.measuredContext { month, city }`** (no guarda temp/humedad).
- **GPS**: marcar punto en el mapa (sin BD de campos propia para medir distancia);
  distancia = `haversineMeters(GPS, objetivo)`.
- **Campos**: OpenStreetMap vía Overpass, **offline-first** (prefetch en build-time
  con `scripts/fetch-courses.mjs` → `assets/courses/*.json`). Licencia ODbL
  (atribución obligatoria). La interfaz `CourseProvider` no cambia si algún día se
  descargan campos en vivo.
- **País**: lista curada (v1), ampliable (`src/ui/forms/countries.ts`).
- **Tabs a medida** + **AppBackground por pantalla** (ver §2).

---

## 5. Cómo se trabaja en este repo (flujo)

1. **`main` está protegida** (un hook bloquea commits directos). Siempre:
   `git checkout -b <feat|fix|docs>/...`.
2. **Spec → plan → código.** Cada incremento: escribe un plan en `docs/plans/`,
   luego implementa.
3. **TDD en lógica pura** (`domain/`, `ui/forms/`): test → rojo → implementar →
   verde. **Tests de humo** en componentes (`@testing-library/react-native`).
4. **Verificación antes de PR:**
   ```bash
   npm run typecheck && npm run lint && npm test
   npx expo export --platform web   # smoke del bundle para cambios de UI
   ```
5. Commits pequeños y coherentes; el mensaje termina con la línea
   `Co-Authored-By: Claude ...`.
6. `git push -u origin <rama>` → `gh pr create` → `gh pr merge --merge --delete-branch`
   → `git checkout main && git pull`.

**Cuenta GitHub:** `pablorenedolastra` (personal del usuario). Repo privado
`pablorenedolastra/YardageBook`.

---

## 6. Comandos útiles

```bash
npm run web         # o: npx expo start --web  → preview en http://localhost:8081
npm test            # Jest (jest-expo)
npm run typecheck   # tsc --noEmit
npm run lint        # expo lint
npm run format      # prettier --write .
node scripts/fetch-courses.mjs --name "Valderrama" --out assets/courses/valderrama.json
```

---

## 7. Gotchas (cosas que ya nos han mordido)

- **Preview web**: en este modo Expo NO abre el navegador solo → abrir
  `http://localhost:8081` a mano. El Inc.7 (mapa/GPS) **no** se ve en web ni Expo
  Go → necesita dev build.
- **`jest.setup.js`** mockea `expo-font` incluyendo `isLoaded`/`loadAsync`
  (lo necesita `@expo/vector-icons`). Si añades libs que tocan fuentes en tests,
  amplía ese mock.
- **`tsconfig.json`** tiene `"types": ["jest", "react"]` (si no, `tsc` no ve los
  globals de Jest en los `.test.ts`).
- **`TabBarProps`** se deriva del componente `Tabs` (no importar tipos de rutas
  internas de react-navigation).
- **AppBackground por pantalla** (ver §2): no centralizar o las tabs se solapan en web.
- **Costes de publicación**: Apple 99 $/año; Google Play 25 $ pago único (Android
  personal nuevo exige periodo de testing con ~12 testers / 14 días antes de público).

---

## 8. Planes de implementación (histórico)

`docs/plans/` — uno por incremento. Útiles como referencia del "cómo" de cada
parte ya construida.
