# YardageBook — Sistema de diseño (UI v1)

- **Fecha:** 2026-06-02
- **Estado:** Aprobado para planificación
- **Ámbito:** Aspecto visual y componentes base de la UI (`src/ui/`)
- **Documento padre:** [Documento de diseño (v1 / MVP)](./2026-06-02-yardagebook-design.md)

---

## 1. Concepto

Un **caddie de bolsillo con estética de cuaderno de campo**: papel reciclado
beige con grano sutil, tinta marrón madera y un único acento verde oliva
apagado. Limpio, plano e impreso sobre papel — sin sombras ni brillos. Las
**cifras mandan** (distancias y palos), así que la tipografía les da peso y se
leen de un vistazo, incluso bajo el sol.

**Una sola fuente de verdad:** todos los valores viven en `src/ui/theme/`. Las
pantallas y componentes **nunca** usan colores, tamaños o espaciados literales;
solo leen tokens del tema. Esto es lo que garantiza consistencia en todo el
proyecto.

---

## 2. Decisiones (resumen)

| Faceta            | Elección                                              |
| ----------------- | ----------------------------------------------------- |
| Papel base        | Crema claro `#EFE7D6` con motas marrón sutiles        |
| Texto             | Marrón madera `#5A4632`                               |
| Acento            | Verde oliva apagado `#6E7A3A`                          |
| Tipografía cifras | Space Grotesk (700)                                   |
| Tipografía cuerpo | Inter                                                 |
| Forma             | Plano con líneas finas (sin sombras), esquinas suaves |
| Iconos            | Línea / contorno (outline)                            |
| Tema              | **Solo claro** en v1 (mejor legibilidad bajo el sol)  |
| Textura           | Grano de papel reciclado **sutil**                    |

---

## 3. Tokens de color

```
Fondo / superficie
  paper        #EFE7D6   fondo de la app y de las tarjetas
  line         #CDBFA4   líneas finas, bordes neutros, separadores (1.5px)

Tinta
  ink          #5A4632   texto principal
  muted        #8A765C   texto secundario, etiquetas, unidades

Acento (oliva)
  accent       #6E7A3A   botones, bordes destacados, recomendación, tab activa
  accentOn     #F4EFDC   texto/icono SOBRE acento
  accentDark   #5A6530   estado "pressed" del acento

Estados
  success      #6E7A3A   (= acento) confirmaciones
  warning      #B5803A   avisos (ámbar terroso)
  danger       #A8492F   errores (teja apagado)
```

- **Contraste:** `ink` sobre `paper` ≈ 7:1 (cómodo a pleno sol). `accentOn`
  sobre `accent` es legible para texto de botón.
- **Estados** se usan preferentemente como **borde + texto** (píldoras de
  contorno), coherente con el lenguaje "plano con líneas". El relleno sólido se
  reserva para la acción primaria (acento).

---

## 4. Tipografía

Dos familias Google Fonts, cargadas con `@expo-google-fonts/*` + `useFonts`:

- **Space Grotesk** — cifras, titulares y el palo recomendado. Pesos 500 / 700.
  Usar `font-variant-numeric: tabular-nums` (cifras de ancho fijo) para que las
  distancias no "bailen".
- **Inter** — cuerpo, etiquetas, controles. Pesos 400 / 500 / 600 / 700.

### Escala tipográfica

| Token         | Familia       | Tamaño / peso | Uso                                  |
| ------------- | ------------- | ------------- | ------------------------------------ |
| `display`     | Space Grotesk | 40 / 700      | La cifra protagonista ("143 m")      |
| `clubName`    | Space Grotesk | 30 / 700      | Palo recomendado ("Hierro 7")        |
| `titleApp`    | Space Grotesk | 18 / 700      | Título de barra superior             |
| `sectionHead` | Space Grotesk | 13 / 700      | Encabezados de bloque                |
| `body`        | Inter         | 15 / 400      | Texto general                        |
| `bodyStrong`  | Inter         | 15 / 600      | Texto enfatizado, valores en listas  |
| `small`       | Inter         | 13 / 400      | Texto secundario                     |
| `caption`     | Inter         | 11 / 600      | Etiquetas UPPERCASE, tracking .14em  |
| `labelAccent` | Inter         | 10 / 700      | "TU PALO" sobre la recomendación, .12em |

---

## 5. Espaciado, forma y elevación

**Espaciado** (escala base-4): `4, 8, 12, 16, 20, 24, 32`. Padding por defecto
de pantalla: `18–20`. Densidad media-espaciosa.

**Radios de esquina:**

| Token        | Valor | Uso                          |
| ------------ | ----- | ---------------------------- |
| `radiusSm`   | 9     | Botones, campos, segmentos   |
| `radiusMd`   | 12    | Tarjetas (objetivo, reco)    |
| `radiusLg`   | 18    | Paneles / contenedores grandes |
| `radiusPill` | 6     | Píldoras de estado           |

**Bordes:** línea fina de **1.5px**. `line` para neutros; `accent` para resaltar
(tarjeta de recomendación, botón secundario).

**Elevación:** **ninguna en v1.** Sin sombras (estética de papel impreso). Si en
el futuro hacen falta modales, se valorará una sombra muy tenue como excepción
documentada.

---

## 6. Textura de papel

Grano de papel reciclado **sutil**: motas marrón finas, opacidad ≈ `0.09`,
mezcla `multiply` sobre el crema.

- **Implementación:** un asset PNG de grano _tileable_ (sin costuras) en
  `assets/`, pintado como capa de fondo de baja opacidad (p. ej. `ImageBackground`
  o `expo-image` a pantalla completa detrás del contenido). Generar el asset es
  una tarea explícita del plan.
- **Regla:** la textura es decorativa y **nunca** debe reducir la legibilidad del
  texto; va por debajo del contenido, no sobre él.

---

## 7. Iconografía

- Estilo **contorno / línea**, grosor de trazo ~1.6, tamaño base 20px.
- Color: `ink` en reposo, `accent` cuando está activo (p. ej. pestaña activa).
- **Librería:** Feather de `@expo/vector-icons` (ya disponible vía Expo, es
  outline y encaja con el lenguaje). Set mínimo para v1: tiro/objetivo, palos,
  perfil, ajustes, mapa/ubicación, +/− (inclinación).

---

## 8. Componentes base (v1)

Cada uno es un componente aislado en `src/ui/components/`, parametrizado por
tokens. Contrato: qué hace, cómo se usa, de qué depende (tokens del tema).

| Componente          | Notas de estilo                                                              |
| ------------------- | ---------------------------------------------------------------------------- |
| `Button` (primary)  | Relleno `accent`, texto `accentOn` Space Grotesk 700, `radiusSm`. Pressed → `accentDark`. |
| `Button` (secondary)| Transparente, borde 1.5px `accent`, texto `accent`.                          |
| `NumberField`       | Borde `line` 1.5px, `radiusSm`, placeholder `muted`, sufijo de unidad `muted`. |
| `SegmentedControl`  | Selector tipo metros/yardas; segmento activo relleno `accent`/`accentOn`.    |
| `Card`              | Fondo `paper`, borde `line` 1.5px, `radiusMd`. Variante `accent` para resaltar. |
| `RecommendationCard`| **Pieza estrella.** Borde `accent`, etiqueta `labelAccent`, palo en `clubName`, subtexto `muted`. |
| `TargetCard`        | Cifra `display` + fila de condiciones (temp / humedad / pendiente) en `small`/`muted`. |
| `MatrixRow`         | Fila palo↔distancia, separador `line`, distancia en `bodyStrong` Space Grotesk. |
| `StatePill`         | Píldora de contorno (`success`/`warning`/`danger`), `radiusPill`.            |
| `TabBar`            | Borde superior `line`, iconos de línea, activo en `accent`.                  |
| `AppBackground`     | Envoltorio que pinta `paper` + capa de textura sutil.                        |

---

## 9. Estructura en el repo

Encaja en la estructura ya definida en el documento de diseño padre:

```
src/ui/
├── theme/
│   ├── colors.ts        ← tokens de color (sección 3)
│   ├── typography.ts    ← familias + escala (sección 4)
│   ├── spacing.ts       ← espaciado, radios, bordes (sección 5)
│   ├── icons.ts         ← mapeo de iconos Feather (sección 7)
│   └── index.ts         ← `theme` agregado + tipo `Theme`
├── components/          ← componentes de la sección 8
└── screens/             ← pantallas (consumen componentes + theme)
```

**Regla de oro de consistencia:** ningún archivo fuera de `theme/` define
literales de color, tamaño de fuente, radio o espaciado. Se puede reforzar con
una regla de lint que prohíba colores hex en `components/` y `screens/`.

---

## 10. Fuera de alcance (v1)

- Modo oscuro (posible Tier 2/3).
- Animaciones/transiciones más allá de estados de pulsado.
- Ilustraciones o iconografía de marca / logo (decisión aparte).
- Sombras y elevación (estética plana deliberada).

---

## 11. Decisiones a concretar en el plan

- Generación del **asset de textura** de papel (PNG tileable) y su opacidad final.
- Valores exactos de **line-height** y `letterSpacing` por token tipográfico.
- Tamaños de toque mínimos (accesibilidad: objetivo ≥ 44pt).
- Carga de fuentes y pantalla de splash mientras cargan (`useFonts`).
```
