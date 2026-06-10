# Plan — Iteración UX iOS #2 (tras probar en iPhone)

**Fecha:** 2026-06-10 · **Rama:** `feat/inc7-hole-map` (PR #12)

## Cambios

1. **ClubPickerSheet tapado por la barra de estado.** El header ("Cerrar") está en
   `top: 0` bajo el notch/barra de iOS. Fix: `useSafeAreaInsets` → `paddingTop` en el
   header. (El hook lee del SafeAreaProvider del árbol aunque la vista vaya en un Modal.)

2. **Gesto de volver deslizando desde el borde.** Habilitar `gestureEnabled: true` en
   el Stack raíz (y onboarding). En la pantalla de Hoyo el botón "‹ CAMPOS" ya existe;
   el gesto de borde es complementario. (Verificación real en device.)

3. **Simular GPS para probar sin estar en el campo.** No se puede falsear el GPS de un
   iPhone real sin Xcode/simulador. Solución: botón **solo `__DEV__`** "Simular GPS en
   el tee" en la pantalla de Hoyo que fija una posición manual (`devGps`) en el tee del
   hoyo. `gps = devGps ?? liveGps` (el manual tiene prioridad sobre el real).
   - Helper puro `simulatedTeePosition(hole)` (TDD): `tees[0]` → extremo de `playLine`
     más lejano al green → green.

4. **Palo recomendado junto a la distancia.** Cada `DistanceChip` muestra, bajo la
   distancia, el palo que la cubre (`recommendClub` sobre esa distancia y la bolsa).
   - `DistanceChip` gana prop `club?`.
   - La pantalla calcula el palo para GPS→objetivo y para objetivo→green y los pasa a
     `HoleMap`, que los reparte a cada chip. (La barra inferior "TU PALO" se mantiene.)
   - "Objetivo movible": ya implementado (tocar mapa / arrastrar anillo); se valida con (3).

## Verificación
typecheck + lint + test + `expo export --platform web`. Prueba real en Expo Go iOS.
