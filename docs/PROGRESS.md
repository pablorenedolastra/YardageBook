# YardageBook — Estado del proyecto y guía para retomar

> **Última actualización:** 2026-06-09 · **Rama principal:** `main` (protegida) · **118 tests verdes**

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
- Sistema de diseño: [`docs/design-system/2026-06-02-yardagebook-design-system.md`](design-system/2026-06-02-yardagebook-design-system.md)
- Pantallas y flujos (manda sobre el de producto donde difieran): [`docs/specs/2026-06-03-yardagebook-ux-screens.md`](specs/2026-06-03-yardagebook-ux-screens.md)
- Proveedor de campos (OSM): [`docs/specs/2026-06-05-courses-provider-osm.md`](specs/2026-06-05-courses-provider-osm.md)

---

## 2. Stack y arquitectura

- **Expo SDK 54 + TypeScript estricto.** Navegación con **expo-router**.
  (Se bajó de 56→54 el 2026-06-09 para poder probar en Expo Go: los dispositivos del
  usuario topan Expo Go en SDK 54. Ver `docs/plans/2026-06-09-sdk-54-downgrade.md`.)
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
| **6** | **Juego · Selección de campo** (servicio `courses` OSM real) | ✅ | #11 |
| **7** | **Juego · Hoyo** (mapa, GPS, recomendación) — **se prueba en Expo Go iOS** | ✅ | #12 |

**Funciona hoy (preview web):** onboarding completo (perfil → bolsa → guardar →
entra a tabs), Yardage Book ver/editar, Perfil ver/editar (unidades cambian y
persisten), gating (reabrir con perfil → directo a tabs), **Selección de campo**
(buscar → resultados → elegir → recientes).

**Solo en app (Expo Go iOS, no web):** **Juego · Hoyo** — mapa satélite, GPS, tocar
para colocar objetivo, distancia haversine y barra de palo recomendado.

### Incremento 6 — hecho
Plan: [`docs/plans/2026-06-09-inc6-course-selection.md`](plans/2026-06-09-inc6-course-selection.md).
- Servicio `src/services/courses/`: `CourseProvider`, `CourseRegistry`,
  `BundledCourseProvider` (registro **inyectable** → testeable sin ficheros),
  `addRecentCourse` (puro), `createCourseProvider()`.
- `scripts/fetch-courses.mjs --batch`: **acumulativo** (reconstruye `index.json` +
  `registry.ts` desde todos los `<id>.json` en disco) + **reintentos con backoff**.
- `AppRepository.load/saveCourseHistory` (clave `yardagebook:course-history`).
- Pantalla `app/(tabs)/index.tsx` (buscador + recientes) + `app/game/[courseId].tsx`
  (placeholder Hoyo 1 con atribución ODbL).

> **Datos piloto:** solo **2 campos** bajados (Valderrama 18/18, Las Brisas 18/18),
> no 5-10. Causa: los mirrors **públicos** de Overpass devuelven 504/timeout
> (rate-limit) y varios nombres no casan con el tag OSM (devuelven 0 greens) →
> harían falta sus `osm-way` concretos. El pipeline es acumulativo: re-ejecutar
> `node scripts/fetch-courses.mjs --batch` (o `--osm-way <id> --out ...` + regenerar)
> suma campos sin perder los bajados. Ampliar el set queda como tarea de datos.

### Incremento 7 — hecho
Plan: [`docs/plans/2026-06-09-inc7-hole-map.md`](plans/2026-06-09-inc7-hole-map.md).
- **`react-native-maps`** (no `expo-maps`, que está en alpha) + **`expo-location`**.
  En SDK 54 ambos van en **Expo Go**; en **Android** Expo Go aporta su clave de Google
  Maps (el mapa se ve sin configurar). Para una build standalone de Android haría falta
  clave propia; iOS usa Apple Maps sin clave.
- Pantalla `app/game/[courseId].tsx`: mapa satélite, permiso + `watchPositionAsync`,
  tocar el mapa → objetivo, `haversineMeters` → `toUnitDistance` → `recommendClub`,
  navegación de hoyos, chip al centro del green, atribución ODbL.
- Componentes: `HoleMap` (único que importa `react-native-maps`; **`hole-map.web.tsx`**
  de fallback para que `expo export --platform web` siga pasando), `GpsMarker`,
  `TargetMarker`, `DistanceChip`, `RecommendationBar`, `PlaysLikeToggle`,
  `GreenCenterChip`, `HoleNavBar`. Lógica pura con TDD: `toUnitDistance`, `hole-navigation`.
- Mocks de `react-native-maps` + `expo-location` en `jest.setup.js`.

> **Verificación:** typecheck/lint/test (118) + `expo export web` ✅ en CI local. La
> **prueba real (GPS, tap, satélite) es en Expo Go iOS** — no automatizable aquí.

> **Plays Like:** el toggle está cableado y **OFF es el flujo completo**; **ON es
> neutro de momento** (elevación 0, sin meteo). La fuente real de desnivel/meteo
> (implica red en campo, choca con offline-first) es **decisión abierta** para una
> iteración posterior.

> **Pendiente Android:** clave Google Maps (`react-native-maps` plugin) para el
> mapa en Android. iOS/Apple Maps no la necesita.

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
  `http://localhost:8081` a mano. **Tras cambiar de rama, recarga forzada en el
  navegador (Cmd+Shift+R)**: la caché vieja deja la web en blanco.
- **Mapa (Inc.7)**: `react-native-maps` **no** renderiza en web (hay
  `hole-map.web.tsx` de fallback para que el export no rompa). **Sí va en Expo Go
  (SDK 54)** → la pantalla de Hoyo se prueba en **Expo Go (Android del usuario)**, no
  en web. Para build standalone Android haría falta clave Google Maps propia.
- **SDK 54, no 56**: el Expo Go de los dispositivos del usuario topa en 54. Si tocas
  versiones, usa `npx expo install` (alinea a 54); algunas dev-deps (jest-expo,
  eslint-config-expo, @types/react/jest, react-test-renderer) hay que fijarlas a mano.
- **`StyleSheet.absoluteFill` no es spreadable** en los tipos de RN 0.81; para spread
  usa `absoluteFillObject`.
- **`jest.setup.js`** mockea `expo-font` (incl. `isLoaded`/`loadAsync` para
  `@expo/vector-icons`) y también **`react-native-maps`** y **`expo-location`** (para
  smoke tests). Si añades libs nativas que se usen en tests, amplía estos mocks.
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
