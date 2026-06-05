# YardageBook — UX: pantallas y flujos (v1)

- **Fecha:** 2026-06-03
- **Estado:** Aprobado para planificación
- **Idioma de la app:** Español
- **Documentos relacionados:** [Diseño de producto v1](./2026-06-02-yardagebook-design.md) · [Sistema de diseño](./2026-06-02-yardagebook-design-system.md)

---

## 1. Resumen

Define todas las pantallas y flujos de la v1: onboarding (perfil + bolsa), las tres
pestañas principales (**Juego**, **Yardage Book**, **Perfil**) y el flujo de juego
estilo "GPS de campo" (elegir campo → hoyo con mapa aéreo, posición GPS, objetivo
táctil y palo recomendado en tiempo real). Toda la UI usa el [sistema de diseño](./2026-06-02-yardagebook-design-system.md)
(papel crema, acento oliva, Space Grotesk + Inter, plano con líneas).

---

## 2. Relación con el diseño de producto original (deltas)

Este spec **revisa** decisiones del [diseño de producto v1](./2026-06-02-yardagebook-design.md).
Donde difieran, manda este documento:

| Tema | Original | Ahora (este spec) |
| --- | --- | --- |
| Datos de campos | "Cero base de datos de campos" | **BD de campos externa** (proveedor). Diseñamos asumiéndola; conseguir los datos queda fuera del diseño. |
| Interacción principal | Entrada manual de distancia + recomendación | **Mapa del hoyo + GPS**: marcar objetivo, metros en la línea, palo recomendado. |
| Perfil | nombre + unidad | **nombre, apellidos, email, país, handicap, unidad** (local, sin cuenta/nube). |
| Baseline de la matriz | temperatura + humedad | **mes + ciudad** donde se midió (metadato) + toggle **"Plays Like"**. |
| Onboarding | crear perfil + matriz manual | **2 pasos**: perfil → bolsa, con menú de preselección de palos. |

**Impacto en el dominio ya construido** (`src/domain`): los modelos `Profile` y
`ClubMatrix` cambian (ver §7). El motor `recommendClub` se mantiene, pero su ajuste
de meteo/inclinación pasa a estar **gobernado por el toggle "Plays Like"** (§6).

---

## 3. Decisiones transversales

- **Perfil local:** alta la primera vez; datos solo en el dispositivo. Sin
  autenticación, sin servidor, sin nube, sin GDPR. El email es un dato del perfil,
  no un identificador de sesión.
- **Idioma:** español en toda la UI. "Yardage Book" se mantiene como nombre propio.
- **Unidades:** metros | yardas, elegidas en el perfil; afectan a toda distancia mostrada.
- **Plays Like:** toggle global del juego. OFF = se recomienda por la distancia
  geométrica al objetivo. ON = se aplica ajuste de desnivel + meteo (lógica fina
  a concretar en el plan; puede derivar normales climáticas de mes+ciudad).
- **Dependencias nativas:** el flujo de Juego usa GPS (`expo-location`) y mapas
  (`react-native-maps`), que **no funcionan en Expo Go ni en web** → requieren un
  *development build*. Onboarding, Yardage Book y Perfil sí se ven en preview web.

---

## 4. Arquitectura de navegación (IA)

```
App
├── (primer arranque, sin perfil) → Flujo de Onboarding
│     1. Perfil           (nombre, apellidos, email, país, handicap, unidades)
│     2. Tu bolsa         (BagEditor: añadir/quitar/distancias + mes/ciudad)
│     → al terminar: persiste perfil + matriz y entra a las pestañas
│
└── (con perfil) → Tab navigator (3 pestañas)
      ├── Juego          → Selección de campo → Hoyo (mapa GPS)
      ├── Yardage Book   → Ver bolsa → Editar bolsa (BagEditor)
      └── Perfil         → Ver perfil → Editar perfil
```

- **Tab bar** según el sistema de diseño: iconos de línea, pestaña activa en oliva,
  borde superior `line`. Orden: Juego · Yardage Book · Perfil.
- El onboarding se muestra **una sola vez** (cuando no hay perfil guardado). En
  arranques posteriores se entra directo a las pestañas.

---

## 5. Pantallas

Cada pantalla vive en `src/ui/screens/` y se compone de componentes de
`src/ui/components/`. Todas consumen tokens del tema (cero literales).

### 5.1 Onboarding · Paso 1 — Perfil
- Indicador de progreso (2 pasos), título "Tu perfil".
- Campos: **Nombre**, **Apellidos**, **Email**, **País** (selector), **Handicap**
  (numérico decimal), **Unidades** (segmentado metros/yardas).
- Botón primario **"Continuar"** (deshabilitado hasta que los campos obligatorios
  sean válidos: nombre, apellidos, email con formato, país).

### 5.2 Onboarding · Paso 2 — Tu bolsa
- Indicador de progreso, título "Tu bolsa", texto guía.
- **`BagEditor`** (componente compartido, ver §5.4) **vacío** al inicio.
- Botón primario **"Empezar a jugar"** (habilitado con ≥1 palo con distancia válida).
- Al confirmar: persiste `Profile` + `ClubMatrix` y navega a las pestañas (Juego).

### 5.3 Yardage Book (pestaña)
- **Modo ver:** cabecera "Yardage Book", contexto "Medido en {mes} · {ciudad}",
  lista de palos (nombre + carry en la unidad del perfil), solo lectura. Un único
  botón inferior **"Editar bolsa"**.
- **Modo editar:** la pantalla muestra el **`BagEditor`**; el botón pasa a
  **"Guardar bolsa"**. "Cancelar" descarta cambios (vuelve a modo ver).

### 5.4 Componente compartido `BagEditor`
Mismo bloque en onboarding y en Yardage Book (consistencia + reutilización):
- Lista de palos; cada fila: etiqueta del palo + **campo de distancia editable**
  (Space Grotesk, sufijo de unidad) + **✕** (color `danger`) para quitar.
- **"+ Añadir palo"** → abre `ClubPickerSheet`.
- **"+ Personalizado"** → crear una entrada nueva (etiqueta libre + distancia).
- Contexto de medición: **mes** (selector) + **ciudad** (texto).
- Reglas: distancias > 0; no duplicar `clubId`; orden estable (driver→wedges).

### 5.5 Componente `ClubPickerSheet`
- Hoja inferior (bottom sheet) con catálogo de palos precargado, agrupado:
  **Maderas** (Driver, Madera 3, Madera 5), **Híbridos** (3/4/5),
  **Hierros** (4–9), **Wedges** (PW, GW, SW, LW).
- Cada palo: **+** para añadir; los ya añadidos aparecen como "Añadido ✓".
- Acceso a **"+ Palo personalizado"** desde la misma hoja.

### 5.6 Perfil (pestaña)
- Cabecera: iniciales en círculo + nombre completo + email + badge **HCP**.
- Filas: Nombre, Apellidos, País.
- **Unidades** (segmentado m/yd) — editable, afecta a toda la app.
- Nota de privacidad: "Tus datos se guardan solo en este móvil. Sin cuenta ni nube."
- Botón **"Editar perfil"** (formulario equivalente al del onboarding paso 1).

### 5.7 Juego · Selección de campo
- Título "Juego", buscador con **autocomplete** sobre la BD de campos externa
  (resultado: nombre del campo + ubicación + nº de hoyos).
- Sección **"Recientes"** (campos jugados, desde almacenamiento local).
- Al elegir campo → navega directamente al **Hoyo 1**.

### 5.8 Juego · Hoyo (pantalla estrella)
Mapa aéreo a pantalla completa con chrome superpuesto (paneles papel/oliva):
- **Mapa satélite** del hoyo (`react-native-maps`, tipo `satellite`), encuadrado al
  hoyo con los datos del campo (tee/green del proveedor).
- **Marcador de posición GPS**: círculo (papel, borde+halo oliva) con la **inicial
  del jugador**.
- **Objetivo**: círculo blanco que el usuario coloca **tocando el mapa**.
- **Línea** GPS→objetivo con la **distancia en metros sobre la línea** (chip `ink`),
  recalculada en tiempo real.
- **Barra de palo recomendado** (prioridad alta, fina, una línea): "TU PALO ·
  {palo} · {metros} m", borde oliva, **siempre por debajo del marcador GPS** (nunca
  lo tapa).
- **Toggle "Plays Like"** (arriba izq.) y **distancia al centro del green** (arriba der.).
- **Navegación de hoyos** (abajo): `‹  Hoyo {n} · PAR {x} · S.I. {y}  ›`.
- Cálculo: distancia GPS→objetivo (haversine) → `recommendClub`. Con Plays Like ON
  se aplica además desnivel + meteo (lógica a concretar en el plan).

---

## 6. Lógica de recomendación en el juego

1. El usuario coloca el objetivo → se calcula la **distancia geométrica** GPS→objetivo.
2. **Plays Like OFF:** `recommendClub` con `elevationChange = 0` y sin ajuste de
   meteo → palo cuyo carry medido se acerca más a esa distancia.
3. **Plays Like ON:** se incorpora desnivel y meteo (vía el motor ya existente). El
   origen exacto de esos datos (desnivel del proveedor/altimetría; meteo en vivo;
   normales históricas de mes+ciudad) se **concreta en el plan**; el diseño solo fija
   que el toggle gobierna si se aplican o no.

---

## 7. Cambios en el modelo de datos

El dominio existente (`src/domain/models`) se actualiza:

```
Profile
  • id
  • firstName        (nuevo)
  • lastName         (nuevo)
  • email            (nuevo)
  • country          (nuevo; código o nombre)
  • handicap         (nuevo; número, admite decimales)
  • unit             (meters | yards)

ClubMatrix
  • measuredContext  { month: 1–12, city: string }   ← sustituye a baseline {temp,humedad}
  • entries: ClubMatrixEntry[]   (sin cambios: clubId, label, carryDistance, order)
```

- El motor `recommendClub` y los ajustes (`adjustForInclination`,
  `adjustCarryForWeather`) **se conservan**. Cuando Plays Like esté ON y haga falta
  `WeatherConditions`, se derivará/obtendrá en la capa de servicios (plan), sin
  cambiar la firma del motor.
- Persistencia: `AppRepository` gana `loadCourseHistory/saveCourseHistory` (recientes).

---

## 8. Servicios nuevos (capa `src/services`)

| Servicio | Propósito | Nota |
| --- | --- | --- |
| `location` | Posición GPS del jugador (`expo-location`) | Requiere permisos + dev build |
| `courses` | Buscar campos y leer geometría de hoyos (proveedor externo) | Interfaz desacoplada; el proveedor concreto se decide en el plan. Mock inicial posible. |
| `weather` | Meteo para Plays Like ON | Ya previsto en diseño original (Open-Meteo) |

`domain/` sigue sin importar de `services/` ni de `ui/` (regla de oro del diseño original).

---

## 9. Componentes UI nuevos a construir

Sobre la base del sistema de diseño (que ya tiene tokens + `AppBackground`):
`SegmentedControl`, `TextField`/`NumberField`, `CountryPicker`, `MonthPicker`,
`BagEditor`, `ClubPickerSheet`, `ClubRow`, `PrimaryButton`/`SecondaryButton`,
`TabBar`, `SearchAutocomplete`, `CourseListItem`, `HoleMap` (envuelve
react-native-maps), `GpsMarker` (inicial), `TargetMarker`, `AimLine` +
`DistanceChip`, `RecommendationBar`, `PlaysLikeToggle`, `GreenDistanceTab`,
`HoleNavBar`, `ProfileHeader`.

---

## 10. Orden de construcción sugerido (para los planes)

Pensado para entregar valor visible pronto y dejar lo nativo (dev build) al final:

1. **Shell de navegación**: tab navigator (Juego/Yardage Book/Perfil) con pantallas
   placeholder + gating de onboarding. (Visible en web.)
2. **Componentes de formulario** (`SegmentedControl`, `TextField`, pickers) +
   **Onboarding Paso 1** + persistencia de `Profile` (modelo actualizado).
3. **`BagEditor` + `ClubPickerSheet`** + **Onboarding Paso 2** + persistencia de
   `ClubMatrix` (modelo actualizado).
4. **Yardage Book** (ver/editar reutilizando `BagEditor`).
5. **Perfil** (ver/editar).
6. **Juego · Selección de campo** (servicio `courses` desacoplado, con mock si el
   proveedor aún no está) + recientes.
7. **Juego · Hoyo**: `HoleMap`, GPS, objetivo, línea+distancia, `RecommendationBar`,
   Plays Like, navegación de hoyos. (Requiere dev build; última fase.)

Cada punto es un plan independiente que produce software ejecutable y testeable.

---

## 11. Fuera de alcance (v1)

- Cuentas/nube/sincronización (perfil local).
- Tarjeta de puntuación, estadísticas, "track shot" (de la referencia Golf19).
- 3D del hoyo, viento, capas avanzadas.
- Edición de la geometría del campo por el usuario.
- Modo oscuro (heredado del sistema de diseño: solo claro en v1).

---

## 12. Decisiones a concretar en el plan

- Proveedor concreto de datos de campos (cobertura, coste, licencia, API) e
  interfaz del servicio `courses`. Posible mock inicial.
- Lógica exacta de **Plays Like ON** (origen de desnivel y meteo; uso de mes+ciudad).
- Catálogo exacto del `ClubPickerSheet` y `clubId`s canónicos.
- Validaciones de formularios (formato de email, rango de handicap).
- Permisos de localización (textos, flujo de denegación) y encuadre del hoyo en el mapa.
