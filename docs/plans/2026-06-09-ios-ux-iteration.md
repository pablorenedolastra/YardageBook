# Plan — Iteración UX tras probar en iPhone (Inc.7)

**Fecha:** 2026-06-09 · **Rama:** `feat/inc7-hole-map` (sobre el PR #12)
Feedback del usuario probando en iPhone real. Tres cambios:

## 1. Botón "+" de añadir palo concreto (ClubPickerSheet)
El "+" por palo es un texto diminuto pegado al marco derecho → difícil de pulsar.
- Botón circular oliva con icono Feather `plus` (≈36 px), `hitSlop` amplio.
- Un pelín separado del marco (margen derecho).

## 2. El teclado iOS tapa las opciones de abajo
- Añadir `automaticallyAdjustKeyboardInsets` a los ScrollView con inputs: onboarding
  perfil, onboarding bolsa, perfil (edición), yardage-book (edición), selección de
  campo y el ScrollView de `ClubPickerSheet` (input de palo personalizado).
- Efecto: el contenido se desplaza para mantener el borde inferior sobre el teclado.

## 3. Iterar la interacción del mapa (Hoyo)
Hoy el objetivo se coloca tocando y se mide GPS→objetivo + chip al centro del green.
Nuevo comportamiento:
- El objetivo **aparece por defecto en el centro del green** (al cargar/cambiar hoyo).
- Se puede **mover a cualquier punto** del hoyo (marcador **arrastrable** + tocar mapa).
- Dos medidas, cada una **junto a su línea**:
  - GPS (jugador) → objetivo (línea `ink`, chip `ink`).
  - objetivo → centro del green (línea `accent`, chip `accent`) — visible solo cuando
    el objetivo se ha movido del centro.
- **Marcador del objetivo:** círculo con **borde de color** (oliva) y **centro
  transparente** (se ve el mapa debajo).
- La recomendación de palo sigue usando la distancia GPS→objetivo.

### Ficheros
- `src/ui/components/distance-chip.tsx`: prop `tone` ('ink' | 'accent').
- `src/ui/components/target-marker.tsx`: anillo (borde color, centro transparente).
- `src/ui/components/hole-map.tsx`: objetivo arrastrable, dos líneas + dos chips.
- `app/game/[courseId].tsx`: objetivo por defecto = centro de green; pasa ambas
  distancias; `onMoveTarget`.
- Tests: actualizar `hole-map.test.tsx` (props nuevas); smoke de `distance-chip` tono.

## Verificación
typecheck + lint + test + `expo export --platform web`. Prueba real en Expo Go iOS.
