# YardageBook — Documento de diseño (v1 / MVP)

- **Fecha:** 2026-06-02
- **Estado:** Aprobado para planificación
- **Plataforma:** Móvil (iPhone primero, Android después)
- **Stack:** React Native + Expo + TypeScript

---

## 1. Visión

Una app móvil **local-first** que actúa como un caddie de bolsillo: dada una
distancia objetivo (introducida a mano o tocando un punto en el mapa), la
inclinación del tiro y las condiciones meteo (temperatura + humedad), recomienda
**qué palo usar**, basándose en la **matriz de palos personal** del usuario (las
distancias reales que pega con cada palo).

Lo que la hace personal y justifica el nombre "YardageBook": no recomienda en
abstracto, recomienda según lo que _tú_ pegas con cada palo.

### Una frase

> _"Estoy a X metros, con estas condiciones → tu app me dice: usa este palo."_

---

## 2. Alcance

### Dentro de la v1 (Tier 1)

- **Profile:** crear perfil (nombre, unidades metros/yardas).
- **Club Matrix MANUAL:** el usuario introduce la distancia de carry de cada palo.
- **Condiciones base de la matriz:** temperatura + humedad en las que se midieron
  las distancias (una sola para toda la matriz).
- **Yardage input manual:** introducir a mano la distancia objetivo.
- **GPS (marcar punto en el mapa):** mapa satélite, el usuario toca el objetivo y
  la app calcula los metros desde su posición GPS. Sin base de datos de campos.
- **Inclinación:** ajuste del tiro cuesta arriba / cuesta abajo.
- **Meteo (temperatura + humedad):** vía API externa, ajusta el carry de los palos.
- **Output club:** una recomendación de palo.

### Fuera de la v1 (backlog explícito)

Tier 2: lie del golpe, otras opciones de palo, matriz AUTO (aprende del
historial), notas personales por hoyo.
Tier 3: bloquear condiciones meteo, app de reloj, comunicación por voz.
Otros descartados de v1: viento, altitud, base de datos de campos, cuentas en la
nube / sincronización.

---

## 3. Arquitectura

Arquitectura en capas. Cada pieza tiene un único propósito y se comunica por
interfaces claras.

```
┌─────────────────────────────────────────────┐
│  UI (pantallas React Native)                  │  ← qué ve y toca el usuario
├─────────────────────────────────────────────┤
│  Núcleo de dominio (TypeScript puro)          │  ← la lógica, SIN React
│   • recommendation-engine                     │     (testeable sin móvil)
│   • adjustments (inclinación + meteo)         │
│   • models (Profile, ClubMatrix, ...)         │
├─────────────────────────────────────────────┤
│  Servicios (puentes con el mundo)             │
│   • location (GPS)                            │
│   • weather (API externa)                     │
│   • storage (persistencia local)             │
└─────────────────────────────────────────────┘
```

**Regla de oro:** `domain/` nunca importa de `ui/` ni de `services/`. El cerebro
no sabe que existe un móvil. Esto lo hace testeable en milisegundos sin emulador
y portable a futuro.

---

## 4. El motor de recomendación (el corazón)

Funciona en dos pasos limpios y separados. Ambos son **funciones puras** (mismas
entradas → misma salida).

**Paso 1 — Objetivo efectivo** (ajuste de inclinación):

```
objetivo_efectivo = distancia_real + ajuste_inclinacion
    (cuesta arriba suma metros, cuesta abajo resta)
```

La inclinación afecta al objetivo (geometría del tiro).

**Paso 2 — Carry de cada palo HOY** (ajuste de meteo):

```
para cada palo:
    carry_hoy = carry_medido ajustado de (condicionesBase de la matriz) → (meteo de HOY)
    (si hoy hace más calor/humedad que cuando se midió → carry_hoy > carry_medido)
```

La meteo afecta a cada palo (densidad del aire). El ajuste es la **diferencia**
entre las condiciones de hoy y las condiciones base de la matriz — nunca un valor
absoluto.

**Paso 3 — Elegir:**

```
recomendar el palo cuyo carry_hoy se acerca más al objetivo_efectivo
```

Devuelve **1 palo** en v1. La arquitectura deja la puerta abierta a "otras
opciones" (Tier 2) sin reescribir.

### Lógica física a definir en el plan

Las fórmulas y coeficientes concretos (metros por grado de temperatura, por % de
humedad, por % de pendiente) se definen como **tarea explícita** en el plan de
implementación. v1 usará un modelo simple y **parametrizable**, fácil de afinar
con experiencia real en campo. No es magia: es una función documentada y testeada.

---

## 5. Modelo de datos (local-first, vive solo en el móvil)

```
Profile
  • id
  • nombre
  • unidades            (metros | yardas; por defecto metros)

ClubMatrix              (pertenece a un Profile)
  • condicionesBase     { temperatura, humedad }   ← una para toda la matriz
  • entries: ClubMatrixEntry[]

ClubMatrixEntry         (una fila por palo)
  • clubId              (ej. "7-iron", "PW", "Driver")
  • etiqueta            (texto visible)
  • distanciaCarry      (en la unidad del perfil)
  • orden
```

Datos pequeños, planos, sin servidor. Persistidos localmente en el dispositivo.

---

## 6. Estructura del repositorio

```
YardageBook/
├── docs/
│   ├── specs/              ← diseños aprobados (este doc)
│   ├── plans/              ← planes de implementación
│   └── decisions/          ← ADRs (decisiones técnicas con su porqué)
├── src/
│   ├── domain/             ← EL CEREBRO. TypeScript puro, sin React.
│   │   ├── recommendation/ ← motor: elegir palo
│   │   ├── adjustments/    ← inclinación + meteo
│   │   └── models/         ← tipos: Profile, ClubMatrix, ClubMatrixEntry
│   ├── services/           ← puentes con el mundo
│   │   ├── location/       ← GPS (expo-location)
│   │   ├── weather/        ← API meteo
│   │   └── storage/        ← persistencia local
│   ├── ui/
│   │   ├── screens/        ← pantallas
│   │   ├── components/     ← piezas reutilizables
│   │   └── theme/          ← colores, tipografías
│   └── app/                ← navegación y arranque (Expo Router)
├── app.json                ← config de Expo
├── eas.json                ← config de build/deploy (EAS)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Librerías

| Necesidad                    | Librería                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| Framework                    | Expo (SDK más reciente) + expo-router (navegación por archivos) |
| Lenguaje                     | TypeScript (estricto)                                           |
| Mapa satélite + marcar punto | react-native-maps                                               |
| GPS                          | expo-location                                                   |
| Almacenamiento local         | expo-sqlite o AsyncStorage (se decide en el plan según volumen) |
| Meteo                        | API externa — Open-Meteo (gratis y sin API key) como candidata  |
| Tests                        | Jest + React Native Testing Library                             |
| Calidad                      | ESLint + Prettier + TypeScript strict                           |

---

## 8. Cómo trabajamos (flujo)

1. **Spec → Plan → Código**, feature a feature, empezando por el Tier 1.
2. **El cerebro primero, con tests.** Como `domain/` es TS puro, se construye y
   testea el motor de recomendación **antes** de tocar una pantalla.
3. **Commits pequeños** a GitHub. Cada pieza con sentido propio.
4. **Orden sugerido del Tier 1:**
   modelos + motor (con tests) → almacenamiento local → pantallas de perfil y
   matriz → entrada manual de distancia + recomendación → meteo → GPS (mapa +
   marcar punto).

---

## 9. Camino a publicación

- **Desarrollo diario:** Expo Go en el iPhone (QR, sin cables) para iterar rápido.
- **GPS/mapas:** requieren un _development build_ (no solo Expo Go) por usar
  módulos nativos — paso sencillo, quedará documentado.
- **Publicar iPhone:** cuenta Apple Developer (**99 $/año**). Build y subida con
  EAS Build (nube de Expo, sin pelearse con Xcode).
- **Publicar Android:** cuenta Google Play (**25 $ pago único**). Mismo código vía
  EAS. Nota: cuentas personales nuevas exigen periodo de testing (~12 testers, 14
  días) antes de publicar al público — es tiempo, no dinero.

### Costes obligatorios del proyecto

- Desarrollo y testing: **0 €** (Expo Go, plan gratuito de EAS, Open-Meteo gratis,
  datos local-only → cero servidor).
- iPhone: 99 $/año. Android: 25 $ una vez.

---

## 10. Decisiones clave (resumen)

| Decisión         | Elección                               | Por qué                                                                        |
| ---------------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| Propósito        | Recomendador de palo                   | Núcleo del Functionalities Map                                                 |
| Lógica reco v1   | Distancia + inclinación + temp/humedad | Acotado y con sentido físico; sin viento/lie/altitud                           |
| GPS              | Marcar punto en mapa                   | Cero base de datos de campos; funciona globalmente                             |
| Datos            | Local-only en el móvil                 | Sin servidor, sin login, sin GDPR; máxima velocidad de lanzamiento             |
| Condiciones base | Una para toda la matriz                | Más simple de mantener                                                         |
| Stack            | React Native + Expo + TS               | Un código para iOS+Android; alineado con React/TS; camino corto a la App Store |
