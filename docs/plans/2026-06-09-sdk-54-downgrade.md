# Plan — Bajar el proyecto de Expo SDK 56 a SDK 54

**Fecha:** 2026-06-09 · **Rama:** `feat/inc7-hole-map` (se hace junto al Inc.7)

## Por qué

SDK 56 está publicado, pero el **Expo Go** que los dispositivos del usuario pueden
instalar está topado en **54** (iPhone corporativo bloqueado; versiones de SO; lío
"Expo Go y el App Store, mayo 2026"). Resultado: ningún móvil del usuario abre un
proyecto SDK 56 en Expo Go. El **único dispositivo de prueba real es un Android
personal**, y en **SDK 54 funciona con Expo Go directo** (incluido el mapa: Expo Go
aporta su clave de Google Maps en Android). No usamos ninguna función exclusiva de
56 (expo-router, react-native-maps, expo-location existen en 54), así que bajar es
mecánico. Decisión del usuario (2026-06-09).

## Pasos

1. `npm install expo@^54` → fija Expo 54.
2. `npx expo install --fix` → alinea `react-native`, `react`, `react-dom`,
   `expo-*`, `react-native-maps`, `react-native-screens`, `safe-area-context`,
   `jest-expo`, `eslint-config-expo`, `@types/react` a las versiones de SDK 54.
3. Ajustar código solo si algo rompe (no se espera: RN de alto nivel,
   `borderCurve`/`pointerEvents`/expo-router estables entre 54 y 56).
4. Verificar: `typecheck` + `lint` + `test` (118) + `expo export --platform web`.
5. Actualizar `AGENTS.md` (docs v56 → **v54.0.0**) y `docs/PROGRESS.md`.

## Riesgos

- `react-native` baja 0.85 → 0.81 (aprox.) y `react` 19.2 → 19.1: cambios menores,
  nuestro código no toca API afectadas. Si `tsc` o tests fallan, ajustar puntual.
- `package-lock.json` se regenera; commitear el resultado.

## Verificación de éxito

- Suite verde en 54 + export web ok.
- El usuario abre la app en **Expo Go (Android, SDK 54)** escaneando el QR y prueba
  el Inc.7 (mapa, GPS, tap, recomendación).
