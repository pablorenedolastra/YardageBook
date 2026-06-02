# YardageBook

Un caddie de bolsillo. Le dices a qué distancia estás (a mano o tocando un punto
en el mapa), añade la inclinación y la meteo, y te recomienda **qué palo usar**
según tu propia matriz de palos.

App móvil **local-first** (tus datos viven en tu teléfono, sin servidor ni
cuentas). iPhone primero, Android después.

## Stack

- **React Native + Expo** (un código → iOS + Android)
- **TypeScript** (estricto)
- `react-native-maps` (mapa + marcar objetivo) · `expo-location` (GPS) ·
  almacenamiento local · API de meteo (Open-Meteo)

## Documentación

- Diseño v1: [`docs/specs/2026-06-02-yardagebook-design.md`](docs/specs/2026-06-02-yardagebook-design.md)
- Planes de implementación: `docs/plans/`
- Decisiones técnicas (ADRs): `docs/decisions/`

## Estado

🚧 En arranque (zero-to-one). Definido el diseño de la v1; pendiente el plan de
implementación y el código.
