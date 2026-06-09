# Proveedor de datos de campos (`courses`) — OpenStreetMap / Overpass

**Fecha:** 2026-06-05
**Estado:** Contrato listo para implementar. Script de extracción validado contra datos reales.
**Resuelve:** el hueco abierto en el spec de pantallas (§8: servicio `courses`, "proveedor concreto se decide en el plan").
**Para:** el agente que implemente la fase 6 (Selección de campo) y 7 (Juego · Hoyo) del orden de construcción.

---

## 0. TL;DR para quien implementa

- **Proveedor elegido:** OpenStreetMap, leído vía **Overpass API**. Gratis, licencia ODbL (uso comercial permitido con atribución).
- **Es la única fuente con geometría real por hoyo** (greens, tees, bunkers, calles, hazards como polígonos). Las APIs comerciales o solo dan scorecards/puntos, o cuestan ≥399 $/mes.
- **Arquitectura: offline-first.** NO se consulta Overpass desde el móvil. Un script de build-time (`scripts/fetch-courses.mjs`, **ya escrito y validado**) baja cada campo, lo normaliza al modelo de dominio y lo guarda como **JSON versionado** en `assets/courses/`. La app lo lee offline.
- **Medición de distancia (decisión de producto):** el usuario **toca el mapa** para colocar el objetivo → distancia = **haversine(GPS del jugador ↔ punto tocado)**. El **centro del green** es una **lectura secundaria** (chip "al centro del green" de la pantalla 5.8), también por haversine(GPS ↔ centro green). De momento solo necesitamos el **centro del green**; el polígono completo es para dibujar.
- **Cobertura España (censo real OSM, jun-2026):** 592 campos, **4.364 greens**, 3.090 líneas de hoyo. Hay datos de sobra; la calidad varía por campo y se valida campo a campo con el script.

---

## 1. Arquitectura: offline-first (build-time prefetch)

```
                 BUILD-TIME (máquina del dev)          RUNTIME (móvil, offline)
                 ─────────────────────────────         ────────────────────────
  Overpass API ──► scripts/fetch-courses.mjs ──► assets/courses/<slug>.json ──► CourseProvider ──► UI (HoleMap)
   (OSM, ODbL)      (query + transform)            (JSON normalizado,            (lee bundle)       react-native-maps
                                                    versionado en git)
```

**Por qué offline y no consulta en vivo:**

- Un yardage book se usa **en el campo**, a menudo con mala cobertura → los datos deben venir empaquetados.
- Las instancias públicas de Overpass **no admiten tráfico de producción** (rate-limit / ToS); en pruebas dan 429/timeout con facilidad.
- Los datos de un campo **no cambian** de un día para otro → no hay valor en consultarlo en vivo.
- El JSON por campo es pequeño (Valderrama completo con polígonos ≈ 80-150 KB; sin polígonos, < 20 KB).

**Refresco:** re-ejecutar el script y commitear el JSON actualizado. No es runtime.

**Evolución futura (no MVP):** si se quiere descargar campos bajo demanda, el mismo `transform()` sirve; se añadiría una capa de caché en `AsyncStorage` y un endpoint Overpass propio o de pago. La **interfaz `CourseProvider` no cambia**.

---

## 2. Modelo de dominio (nuevos tipos)

Crear en `src/domain/models/`. Sigue las convenciones existentes (tipado estricto, JSDoc en español, sin dependencias de `services/` ni `ui/`).

```ts
// src/domain/models/geo.ts
/** Coordenada geográfica (WGS84). */
export interface LatLng {
  lat: number;
  lng: number;
}
```

```ts
// src/domain/models/course.ts
import { LatLng } from './geo';

/** Información del green de un hoyo. */
export interface GreenInfo {
  /** Centro del green (centroide del polígono OSM golf=green). MVP usa esto. */
  center: LatLng;
  /** Contorno del green, para dibujarlo en el mapa. Opcional. */
  polygon?: LatLng[];
}

/** Un hoyo del campo. */
export interface Hole {
  /** Número de hoyo, 1..18 (o 1..9). */
  ref: number;
  /** Par del hoyo, si OSM lo trae. */
  par?: number;
  /** Stroke index / hándicap del hoyo (S.I.), si OSM lo trae. */
  strokeIndex?: number;
  /** Green del hoyo (siempre presente si el hoyo se incluye). */
  green: GreenInfo;
  /** Puntos de tee del hoyo (varios: amarillas/blancas/rojas…). Para encuadrar el mapa. */
  tees: LatLng[];
  /** Línea de juego tee→green (polilínea OSM golf=hole). Para encuadre y dibujo. */
  playLine: LatLng[];
}

/** Un campo de golf normalizado. */
export interface Course {
  /** Id estable, ej. "osm-way-237391513". */
  id: string;
  /** Nombre del campo, ej. "Club de Golf Valderrama". */
  name: string;
  /** Origen del dato. */
  source: 'osm';
  /** Centro del campo (para listado, búsqueda y encuadre inicial). */
  location: LatLng;
  /** Nº de hoyos con datos. */
  holeCount: number;
  holes: Hole[];
  /** Texto de atribución obligatorio (ODbL). Mostrar en la UI del mapa. */
  attribution: string;
}
```

> **Garantía del transform:** un `Hole` solo se incluye si tiene `green.center` resuelto. Si un hoyo del campo no tiene green mapeable en OSM, queda fuera y `holeCount` lo refleja (señal de campo incompleto → ver §8 fallback).

---

## 3. Interfaz del servicio (`src/services/courses`)

Interfaz desacoplada (como pide el spec §8). La impl. MVP lee del bundle; el mock y una futura impl. en vivo cumplen el mismo contrato.

```ts
// src/services/courses/course-provider.ts
import { Course } from '../../domain';

/** Resumen de campo para listas/búsqueda, sin cargar toda la geometría. */
export interface CourseSummary {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  holeCount: number;
}

/** Proveedor de campos. La impl. MVP lee de assets/courses/ (offline). */
export interface CourseProvider {
  /** Busca campos por texto (nombre). Para la pantalla de selección. */
  search(query: string): Promise<CourseSummary[]>;
  /** Carga un campo completo con geometría por id. */
  getCourse(id: string): Promise<Course | null>;
}
```

**Impl. MVP sugerida (`bundled-course-provider.ts`):**

- Un índice `assets/courses/index.json` (lista de `CourseSummary` + nombre de fichero) generado por el script.
- `search()` filtra el índice en memoria (normalizar acentos/mayúsculas).
- `getCourse(id)` hace `require`/`import` del JSON del campo correspondiente.

`domain/` **no** importa de `services/` (regla de oro del diseño).

---

## 4. Extracción de datos: el script (ya hecho)

**Fichero:** `scripts/fetch-courses.mjs` — Node ≥18, sin dependencias (usa `fetch` global). **Validado contra Valderrama: 18/18 hoyos con centro de green.**

```bash
# Por nombre:
node scripts/fetch-courses.mjs --name "Valderrama" --out assets/courses/valderrama.json
# Por id de way OSM (más preciso si hay ambigüedad de nombre):
node scripts/fetch-courses.mjs --osm-way 237391513 --out assets/courses/valderrama.json
```

Exporta también `buildQuery`, `transform`, `polygonCentroid`, `haversine` para tests/reutilización.

**Tareas pendientes del script (para el agente principal):**

1. **Generar `index.json`**: modo batch que recorre una lista de campos objetivo y produce el índice + los JSON individuales.
2. **Lista de campos objetivo España**: derivarla con una query Overpass de `leisure=golf_course` en España (ver §5) y curarla (quitar pitch&putt/driving ranges si se desea).
3. (Opcional) **Reducir tamaño**: descartar `polygon`/`playLine` si una primera versión solo necesita centros de green.

### 4.1 Query Overpass (validada)

```overpassql
[out:json][timeout:90];
way["leisure"="golf_course"]["name"~"Valderrama",i]->.c;
.c map_to_area->.course;
(
  .c;
  nwr(area.course)["golf"];
);
out geom;
```

Claves: `map_to_area` convierte el polígono del campo en área consultable (NO usar `area[...]` directo: `golf_course` no está en la BD de áreas → da 0 resultados). `out geom;` adjunta coordenadas a ways/relations sin pedir nodos sueltos. Endpoint requiere `User-Agent` propio (si no, **406**). El script hace failover entre 3 mirrors.

### 4.2 Algoritmo de transformación (implementado en el script)

1. **Hoyos**: `golf=hole` (way con `ref`) → ordenar por `ref`. Cada uno trae `par`/`handicap` en tags.
2. **Asociación hoyo→green** (los greens son elementos separados, suele haber más greens que hoyos): de los **dos extremos** de la línea de juego, el "lado del pin" es el extremo cuyo **green más cercano** está a menor distancia (haversine). Ese green es el del hoyo.
3. **Centro del green**: centroide _area-weighted_ (shoelace) del polígono `golf=green`; cae a media de vértices si el anillo es degenerado.
4. **Tees**: `golf=tee` con `ref` coincidente, o los que estén a < 60 m del extremo de salida.
5. **Centro del campo**: centroide del polígono `leisure=golf_course`.

> Caveat conocido: greens/hazards como **relación multipolígono** exportan solo el anillo exterior más largo (el script ya lo maneja); geometrías complejas raras pueden necesitar revisión manual.

---

## 5. Censo de cobertura en España (datos reales, jun-2026)

| Elemento              | Cantidad                       |
| --------------------- | ------------------------------ |
| `leisure=golf_course` | 592 (447 ways + 145 relations) |
| `golf=green`          | 4.364                          |
| `golf=hole`           | 3.090                          |
| `golf=tee`            | (miles)                        |
| `golf=bunker`         | (miles)                        |

~348 campos federados (RFEG/EGA 2023); 592 incluye pitch&putt/ranges/no federados. **Greens abundan** (lo que más importa). La completitud por campo es desigual → validar con el script antes de publicar un campo.

Query para listar todos los campos de España (genera la lista objetivo):

```overpassql
[out:json][timeout:180];
area["ISO3166-1"="ES"][admin_level=2]->.es;
( way["leisure"="golf_course"](area.es); relation["leisure"="golf_course"](area.es); );
out tags center;
```

---

## 6. Medición de distancia (dominio puro)

La pieza central de la pantalla de juego. **Va en `src/domain`** (puro, testeable, sin React).

```ts
// src/domain/geo/distance.ts
import { LatLng } from '../models';

/** Distancia haversine en metros entre dos coordenadas. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
```

**Flujo en la pantalla de juego (§5.8 del spec UX):**

1. GPS del jugador vía `expo-location` → `LatLng`.
2. Usuario toca el mapa → objetivo `LatLng` (evento `onPress` de react-native-maps).
3. `distanciaObjetivo = haversineMeters(gps, objetivo)` → es la `targetDistance` que **alimenta `recommendClub`** (motor ya existente, sin cambios).
4. Chip "al centro del green" (arriba dcha.) = `haversineMeters(gps, hole.green.center)`.
5. Con **Plays Like ON**, esa `targetDistance` pasa por `adjustForInclination`/`adjustCarryForWeather` antes de recomendar (igual que hoy; el origen de desnivel/meteo se concreta aparte).

> La distancia se muestra en metros o yardas según `Profile.unit` (convertir en la capa UI, no en el dominio).

---

## 7. Integración nativa (UI)

- **`react-native-maps`** (`PROVIDER_GOOGLE`, `mapType="satellite"`): `Polygon` para el green, `Polyline` para `playLine`, `Marker` para GPS y objetivo. Soporta GeoJSON pero aquí usamos los arrays `LatLng` directos.
- **Encuadre del hoyo**: `fitToCoordinates([...hole.tees, ...hole.playLine, hole.green.center])`.
- **`expo-location`**: permisos + `watchPositionAsync`. **Requiere dev build** (no Expo Go ni web) → es la última fase del spec.
- **Atribución OBLIGATORIA**: mostrar `course.attribution` ("© OpenStreetMap contributors, ODbL") visible en la pantalla del mapa o en Ajustes/Acerca de.

---

## 8. Licencia, atribución y calidad

**Licencia ODbL 1.0:** uso comercial permitido, sin royalties, sin restricción de campo. Obligaciones: **(1) atribuir a OpenStreetMap** y **(2) share-alike** — esta última **solo** si publicas/redistribuyes la _base de datos derivada_; **mostrar mapas en la app NO la dispara** (es una "Produced Work", solo atribución). Si algún día se redistribuye públicamente el dataset de hoyos modificado, ese dataset debe permanecer abierto bajo ODbL (pedir revisión legal entonces).

**Calidad / fallback:** OSM _puede_ representar todo, pero hay campos con solo el perímetro. Estrategia:

1. Correr el script por campo y mirar `holeCount` + nº de hoyos con green.
2. Campo completo → publicar. Campo incompleto → **digitalizar a mano** sobre imagen satélite (en iD/JOSM contribuyendo a OSM, o en JSON propio). Fuentes de imagen compatibles con OSM: **Bing/Esri** (tienen acuerdo); **Google no**.
3. MVP: empezar por una **región piloto densa** (Costa del Sol / Valencia) para validar el pipeline antes de escalar.

---

## 9. Desglose de tareas para el agente principal

1. **Dominio:** crear `models/geo.ts`, `models/course.ts` (§2) y `geo/distance.ts` (§6) con tests (`haversineMeters`: casos conocidos + simetría; centroide si se mueve al dominio).
2. **Script batch:** extender `scripts/fetch-courses.mjs` para procesar una lista de campos y generar `assets/courses/index.json` + JSON por campo (§4).
3. **Datos piloto:** generar la lista de campos España (§5), curarla y bajar 5-10 campos piloto a `assets/courses/`.
4. **Servicio:** implementar `CourseProvider` (§3) + `BundledCourseProvider` que lee del bundle. Mock para tests/web.
5. **UI selección (fase 6):** `SearchAutocomplete` + `CourseListItem` consumiendo `provider.search()`; recientes en `AppRepository` (`load/saveCourseHistory`, ya previsto en spec §7).
6. **UI juego (fase 7, dev build):** `HoleMap` (satélite + green polygon + playLine), `GpsMarker`, `TargetMarker` (onPress), `AimLine`+`DistanceChip` (haversine), `RecommendationBar` (→ `recommendClub`), chip centro de green, `HoleNavBar`.
7. **Atribución ODbL** visible (§7).

---

## 10. Decisiones abiertas (no bloquean el MVP)

- **front/center/back del green:** ¿basta el centroide (MVP) o se quieren los 3 puntos? Se pueden derivar del polígono del green proyectando sobre la línea de juego — dejar para iteración 2.
- **Tamaño del bundle:** ¿incluir `polygon`/`playLine` desde el día 1 o solo `green.center`? Recomendado incluirlos (sigue siendo pequeño) para no re-fetchear al añadir el dibujo del green.
- **Posición de bandera (pin) dinámica:** OSM no la da fiable (`golf=pin` escaso). Fuera de alcance; el centro del green es suficiente.

---

**Anexo — verificación realizada:** query Overpass probada en 3 mirrors; `scripts/fetch-courses.mjs` ejecutado contra "Club de Golf Valderrama" (`osm-way-237391513`) → 18/18 hoyos con par, S.I., centro de green (polígonos de 26-46 pts), tees y línea de juego; sanity check hoyo 1 (par 4) = 314 m tee→green. Datos © OpenStreetMap contributors, ODbL 1.0.
