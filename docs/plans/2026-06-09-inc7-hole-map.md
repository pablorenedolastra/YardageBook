# Plan — Incremento 7: Juego · Hoyo (mapa, GPS, recomendación)

**Fecha:** 2026-06-09 · **Rama:** `feat/inc7-hole-map`
**Specs:** [`ux-screens`](../specs/2026-06-03-yardagebook-ux-screens.md) §5.8, §6;
[`courses-provider-osm`](../specs/2026-06-05-courses-provider-osm.md) §6, §7, §9.6.

## Objetivo

La pantalla estrella: mapa satélite del hoyo con posición GPS, objetivo que se
coloca tocando el mapa, distancia haversine en vivo y **barra de palo recomendado**
(reusa `recommendClub`). Navegación entre hoyos y atribución ODbL. Reemplaza el
placeholder `app/game/[courseId].tsx` del Inc.6.

## Decisiones (cerradas con el usuario)

- **Mapa: `react-native-maps`** (no `expo-maps`, que está en alpha). En SDK 56 va en
  **Expo Go**; **iOS usa Apple Maps en modo satélite sin API key** (somos iPhone-first).
  Android (clave Google Maps) queda fuera de este incremento.
- **Plays Like:** toggle visible y cableado; **OFF completo** (flujo núcleo). **ON
  neutro de momento** (elevación 0, sin meteo) — la fuente real de desnivel/meteo
  (implica red en campo, choca con offline-first) se concreta en un paso posterior.
- **No se verifica en web** (el mapa nativo no renderiza en react-native-web). Se
  prueba en **Expo Go (iPhone/simulador iOS)**. Para que `expo export --platform web`
  siga pasando, los componentes que importan `react-native-maps` tienen variante
  `.web.tsx` de fallback ("mapa no disponible en web").

## Trabajo (en orden)

### 1. Dependencias + config
- `npx expo install react-native-maps expo-location`.
- `app.json` → `plugins`: añadir `expo-location` con `locationWhenInUsePermission`
  (texto en español). `react-native-maps` no necesita plugin para iOS/Apple Maps.

### 2. Lógica pura (TDD)
- `toUnitDistance(meters, unit)` en `src/ui/forms/units-format.ts`: convierte metros
  (haversine) a la unidad del perfil (yd = m / 0.9144). Tests: metros passthrough,
  conversión a yardas, redondeo en la capa de presentación.
- `hole-navigation.ts` (puro): `clampHoleIndex(i, count)`, `prevHole`/`nextHole`
  (clamp 1..count). Tests de límites.
- El cálculo distancia→recomendación se orquesta en la pantalla:
  `haversineMeters(gps, target)` → `toUnitDistance` → `recommendClub({ targetDistance,
  matrix, elevationChange: 0 })` (Plays Like OFF). Sin nuevo motor.

### 3. Componentes (smoke test donde aplique; `react-native-maps` mockeado en jest)
- `hole-map.tsx` / `hole-map.web.tsx` — `MapView` (`mapType="satellite"`), `Polygon`
  (green), `Polyline` (playLine), `onPress`→coordenada objetivo, `ref.fitToCoordinates`
  con `[...tees, ...playLine, green.center]`. `.web.tsx`: mensaje de fallback.
- `gps-marker.tsx` — `Marker` en la posición GPS: círculo papel, borde/halo oliva,
  inicial del jugador.
- `target-marker.tsx` — `Marker` blanco en el punto tocado.
- `aim-line.tsx` — `Polyline` GPS→objetivo + `distance-chip.tsx` (chip `ink` con la
  distancia, en la unidad del perfil, recalculada en vivo).
- `recommendation-bar.tsx` — barra fina una línea: "TU PALO · {palo} · {n} {unidad}",
  borde oliva; **siempre por debajo del marcador GPS**. Smoke test (puro RN).
- `plays-like-toggle.tsx` — toggle arriba izq. Smoke test.
- `green-center-chip.tsx` — arriba der.: "al centro del green" =
  `haversineMeters(gps, hole.green.center)` en unidad de perfil. Smoke test.
- `hole-nav-bar.tsx` — abajo: `‹  Hoyo {n} · PAR {x} · S.I. {y}  ›`. Smoke test.

### 4. Pantalla `app/game/[courseId].tsx`
- Carga: `getCourse(courseId)` + `loadProfile()` + `loadMatrix()` (repo).
- GPS: `expo-location` → permiso (`requestForegroundPermissionsAsync`) +
  `watchPositionAsync`; estados: pidiendo permiso / denegado / sin fix / ok.
- Estado de hoyo (índice 1..holeCount) con `hole-nav-bar`.
- Tap en mapa → objetivo; distancia + recomendación en vivo.
- Overlays (chrome papel/oliva sobre el mapa): toggle, chip green, aim+chip,
  recommendation bar, hole-nav, **atribución ODbL** visible.
- Casos borde: sin permiso GPS (mensaje + reintento); matriz vacía (sin recomendación,
  invitar a configurar bolsa); campo no encontrado.
- Mantiene `<AppBackground>` donde no esté el mapa a pantalla completa.

### 5. Mocks de test
- `jest.setup.js`: mock de `react-native-maps` (MapView/Marker/Polygon/Polyline como
  Views) y de `expo-location` (permiso concedido + posición fija) para smoke tests.

### 6. Verificación
- `npm run typecheck && npm run lint && npm test`.
- `npx expo export --platform web` (debe pasar gracias a los `.web.tsx`).
- **Verificación real en Expo Go iOS** (la hace el usuario): GPS real, tocar mapa,
  ver distancia y palo. No automatizable aquí.

## Riesgos / notas
- **react-native-maps en Expo Go SDK 56:** el doc v56 dice que va en Expo Go sin
  setup. Si no renderizase, fallback rápido: `npx expo run:ios` (dev build local).
- **Unidades:** la matriz está en unidad de perfil; convertir SIEMPRE haversine
  (metros) a esa unidad antes de `recommendClub` y para mostrar.
- **Plays Like ON:** queda como decisión abierta documentada (desnivel + meteo).
