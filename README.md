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

- **Estado del proyecto y cómo retomar: [`docs/PROGRESS.md`](docs/PROGRESS.md)** ← empieza aquí
- Specs (diseño): `docs/specs/`
- Planes de implementación: `docs/plans/`

## Estado

🚧 En construcción. Onboarding, Yardage Book y Perfil funcionando (local-first).
Pendiente el flujo de Juego (selección de campo + mapa/GPS). Detalle y siguientes
pasos en [`docs/PROGRESS.md`](docs/PROGRESS.md).
