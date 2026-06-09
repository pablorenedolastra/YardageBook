# UI Theme Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single source of truth for YardageBook's look — design tokens, font loading, and a paper background — and prove it renders on device.

**Architecture:** A pure-TypeScript token layer in `src/ui/theme/` (colors, typography, spacing, icons) consumed through one aggregated `theme` object. Fonts (Space Grotesk + Inter) load via a `useAppFonts` hook. An `AppBackground` component paints the recycled-paper canvas every screen sits on. `App.tsx` loads fonts and renders a proof screen that exercises the tokens.

**Tech Stack:** Expo SDK 56, React Native 0.85, TypeScript (strict), `expo-font` + `@expo-google-fonts/*`, `@expo/vector-icons` (Feather), Jest + `@testing-library/react-native`.

> ⚠️ **Per `AGENTS.md`:** before implementing the font-loading and asset tasks, confirm the exact APIs against https://docs.expo.dev/versions/v56.0.0/ (especially `expo-font` `useFonts` and `expo-image`/`ImageBackground`). The code below targets the stable SDK 56 API.

**Scope note:** This plan delivers the _foundation only_. The base components (`Button`, `NumberField`, `SegmentedControl`, `Card`, `RecommendationCard`, `TargetCard`, `MatrixRow`, `StatePill`, `TabBar`) are a **separate follow-up plan** that builds on these tokens.

**Spec:** [docs/specs/2026-06-02-yardagebook-design-system.md](../specs/2026-06-02-yardagebook-design-system.md)

---

## File Structure

```
src/ui/theme/
├── color-utils.ts        ← withOpacity() helper (Task 2)
├── color-utils.test.ts
├── colors.ts             ← color tokens (Task 3)
├── colors.test.ts
├── typography.ts         ← font families + text variants (Task 4)
├── typography.test.ts
├── spacing.ts            ← spacing, radius, border tokens (Task 5)
├── spacing.test.ts
├── icons.ts              ← Feather icon name map (Task 6)
├── icons.test.ts
├── use-app-fonts.ts      ← font-loading hook (Task 8)
├── use-app-fonts.test.ts
└── index.ts              ← aggregated `theme` + `Theme` type (Task 7)

src/ui/components/
├── app-background.tsx    ← paper canvas (Task 9, texture added Task 11)
└── app-background.test.tsx

App.tsx                   ← font load + proof screen (Task 10, modified)
assets/paper-texture.png  ← tileable grain (Task 11)
```

---

### Task 1: Install dependencies

**Files:**

- Modify: `package.json` (via installer)

- [ ] **Step 1: Install runtime deps with the Expo installer (SDK-matched versions)**

Run:

```bash
npx expo install expo-font @expo-google-fonts/space-grotesk @expo-google-fonts/inter
```

Expected: `package.json` gains `expo-font`, `@expo-google-fonts/space-grotesk`, `@expo-google-fonts/inter`. (`@expo/vector-icons` already ships with `expo` — do not add it separately.)

- [ ] **Step 2: Install test deps (react-test-renderer must match React 19.2.3)**

Run:

```bash
npm install -D @testing-library/react-native react-test-renderer@19.2.3
```

Expected: both appear under `devDependencies`.

- [ ] **Step 3: Verify the toolchain still builds**

Run: `npm run typecheck`
Expected: exits 0 (no type errors).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build(ui): add font + RN testing dependencies"
```

---

### Task 2: `withOpacity` color helper

A pure helper used later by the texture overlay and any translucent fills. Building it first gives us a TDD warm-up and a dependency-free util.

**Files:**

- Create: `src/ui/theme/color-utils.ts`
- Test: `src/ui/theme/color-utils.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/color-utils.test.ts
import { withOpacity } from './color-utils';

describe('withOpacity', () => {
  it('añade el canal alfa en formato #RRGGBBAA', () => {
    expect(withOpacity('#6E7A3A', 1)).toBe('#6E7A3AFF');
    expect(withOpacity('#6E7A3A', 0)).toBe('#6E7A3A00');
  });

  it('redondea el alfa (0.09 -> 17 -> "17")', () => {
    expect(withOpacity('#000000', 0.09)).toBe('#00000017');
  });

  it('acepta hex en minúsculas y lo normaliza a mayúsculas', () => {
    expect(withOpacity('#abcdef', 0.5)).toBe('#ABCDEF80');
  });

  it('lanza si el alfa está fuera de [0, 1]', () => {
    expect(() => withOpacity('#000000', 1.5)).toThrow();
    expect(() => withOpacity('#000000', -0.1)).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/color-utils.test.ts`
Expected: FAIL — "Cannot find module './color-utils'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/color-utils.ts

/** Devuelve un color hex de 8 dígitos (#RRGGBBAA) aplicando opacidad a un hex de 6. */
export function withOpacity(hex: string, alpha: number): string {
  if (alpha < 0 || alpha > 1) {
    throw new Error(`alpha debe estar entre 0 y 1, recibido: ${alpha}`);
  }
  const channel = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return (hex + channel).toUpperCase();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/color-utils.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/color-utils.ts src/ui/theme/color-utils.test.ts
git commit -m "feat(ui): add withOpacity color helper"
```

---

### Task 3: Color tokens

**Files:**

- Create: `src/ui/theme/colors.ts`
- Test: `src/ui/theme/colors.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/colors.test.ts
import { colors } from './colors';

describe('colors', () => {
  it('expone todos los tokens del sistema de diseño', () => {
    expect(Object.keys(colors).sort()).toEqual(
      [
        'accent',
        'accentDark',
        'accentOn',
        'danger',
        'ink',
        'line',
        'muted',
        'paper',
        'success',
        'warning',
      ].sort(),
    );
  });

  it('todos los valores son hex de 6 dígitos', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('success reutiliza el acento oliva (decisión del spec)', () => {
    expect(colors.success).toBe(colors.accent);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/colors.test.ts`
Expected: FAIL — "Cannot find module './colors'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/colors.ts

/** Paleta del sistema de diseño YardageBook. Única fuente de verdad de color. */
export const colors = {
  paper: '#EFE7D6', // fondo de app y tarjetas
  line: '#CDBFA4', // líneas finas, bordes neutros, separadores
  ink: '#5A4632', // texto principal
  muted: '#8A765C', // texto secundario, etiquetas, unidades
  accent: '#6E7A3A', // acción, bordes destacados, recomendación
  accentOn: '#F4EFDC', // texto/icono sobre acento
  accentDark: '#5A6530', // estado "pressed" del acento
  success: '#6E7A3A', // = acento
  warning: '#B5803A', // ámbar terroso
  danger: '#A8492F', // teja apagado
} as const;

export type ColorToken = keyof typeof colors;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/colors.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/colors.ts src/ui/theme/colors.test.ts
git commit -m "feat(ui): add color tokens"
```

---

### Task 4: Typography tokens

Font family strings MUST match the keys registered by `useFonts` in Task 8 (e.g. `SpaceGrotesk_700Bold`). This is the contract that makes the loaded fonts actually apply.

**Files:**

- Create: `src/ui/theme/typography.ts`
- Test: `src/ui/theme/typography.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/typography.test.ts
import { fontFamily, textVariants } from './typography';

describe('typography', () => {
  it('las familias apuntan a las fuentes que cargará useAppFonts', () => {
    expect(fontFamily.display).toBe('SpaceGrotesk_700Bold');
    expect(fontFamily.body).toBe('Inter_400Regular');
  });

  it('define todas las variantes de texto del spec', () => {
    expect(Object.keys(textVariants).sort()).toEqual(
      [
        'display',
        'clubName',
        'titleApp',
        'sectionHead',
        'body',
        'bodyStrong',
        'small',
        'caption',
        'labelAccent',
      ].sort(),
    );
  });

  it('display y clubName usan cifras de ancho fijo (tabular-nums)', () => {
    expect(textVariants.display.fontVariant).toContain('tabular-nums');
    expect(textVariants.clubName.fontVariant).toContain('tabular-nums');
  });

  it('caption y labelAccent van en mayúsculas', () => {
    expect(textVariants.caption.textTransform).toBe('uppercase');
    expect(textVariants.labelAccent.textTransform).toBe('uppercase');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/typography.test.ts`
Expected: FAIL — "Cannot find module './typography'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/typography.ts
import type { TextStyle } from 'react-native';

/**
 * Claves de familia. Cada string DEBE coincidir con una fuente registrada por
 * useAppFonts (ver use-app-fonts.ts), porque ese es el nombre con el que React
 * Native resuelve la fuente.
 */
export const fontFamily = {
  display: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_700Bold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Escala tipográfica. `satisfies` mantiene la inferencia literal y valida tipos. */
export const textVariants = {
  display: {
    fontFamily: fontFamily.display,
    fontSize: 40,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  clubName: {
    fontFamily: fontFamily.display,
    fontSize: 30,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  titleApp: { fontFamily: fontFamily.heading, fontSize: 18 },
  sectionHead: { fontFamily: fontFamily.heading, fontSize: 13 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.bodySemibold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  caption: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  labelAccent: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/typography.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/typography.ts src/ui/theme/typography.test.ts
git commit -m "feat(ui): add typography tokens"
```

---

### Task 5: Spacing, radius, and border tokens

**Files:**

- Create: `src/ui/theme/spacing.ts`
- Test: `src/ui/theme/spacing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/spacing.test.ts
import { spacing, radius, border } from './spacing';

describe('spacing scale', () => {
  it('toda la escala de espaciado es múltiplo de 4 (base-4)', () => {
    for (const value of Object.values(spacing)) {
      expect(value % 4).toBe(0);
    }
  });

  it('expone los radios del spec', () => {
    expect(radius).toEqual({ pill: 6, sm: 9, md: 12, lg: 18 });
  });

  it('el borde fino es de 1.5px', () => {
    expect(border.hairline).toBe(1.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/spacing.test.ts`
Expected: FAIL — "Cannot find module './spacing'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/spacing.ts

/** Escala de espaciado base-4 (en px). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Radios de esquina. */
export const radius = {
  pill: 6,
  sm: 9,
  md: 12,
  lg: 18,
} as const;

/** Grosores de borde. */
export const border = {
  hairline: 1.5,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/spacing.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/spacing.ts src/ui/theme/spacing.test.ts
git commit -m "feat(ui): add spacing, radius and border tokens"
```

---

### Task 6: Icon name map

A typed map of the Feather icon names used across the app, so screens reference `icons.shot` instead of stringly-typed names.

**Files:**

- Create: `src/ui/theme/icons.ts`
- Test: `src/ui/theme/icons.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/icons.test.ts
import { icons } from './icons';

describe('icons', () => {
  it('define el set mínimo de v1', () => {
    expect(Object.keys(icons).sort()).toEqual(
      ['shot', 'clubs', 'profile', 'settings', 'location', 'increase', 'decrease'].sort(),
    );
  });

  it('todos los nombres son strings no vacíos', () => {
    for (const name of Object.values(icons)) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/icons.test.ts`
Expected: FAIL — "Cannot find module './icons'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/icons.ts

/**
 * Nombres de iconos Feather (@expo/vector-icons) usados en la app.
 * Estilo de contorno, coherente con el lenguaje "plano con líneas".
 */
export const icons = {
  shot: 'target',
  clubs: 'grid',
  profile: 'user',
  settings: 'settings',
  location: 'map-pin',
  increase: 'plus',
  decrease: 'minus',
} as const;

export type IconKey = keyof typeof icons;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/icons.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/icons.ts src/ui/theme/icons.test.ts
git commit -m "feat(ui): add icon name map"
```

---

### Task 7: Aggregated theme barrel

**Files:**

- Create: `src/ui/theme/index.ts`
- Test: `src/ui/theme/index.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/index.test.ts
import { theme } from './index';

describe('theme', () => {
  it('agrega todos los grupos de tokens', () => {
    expect(Object.keys(theme).sort()).toEqual(
      ['colors', 'textVariants', 'fontFamily', 'spacing', 'radius', 'border', 'icons'].sort(),
    );
  });

  it('reexporta los tokens individuales (acceso directo)', () => {
    expect(theme.colors.accent).toBe('#6E7A3A');
    expect(theme.radius.md).toBe(12);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/index.test.ts`
Expected: FAIL — "Cannot find module './index'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/index.ts
import { colors } from './colors';
import { fontFamily, textVariants } from './typography';
import { spacing, radius, border } from './spacing';
import { icons } from './icons';

/** Objeto de tema agregado: única fuente de verdad del aspecto de la app. */
export const theme = {
  colors,
  textVariants,
  fontFamily,
  spacing,
  radius,
  border,
  icons,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './icons';
export * from './color-utils';
export * from './use-app-fonts';
```

> Note: `./use-app-fonts` is created in Task 8. If you run this test before Task 8, temporarily remove that one re-export line, then restore it after Task 8. (Subagent-driven execution does tasks in order, so this is a no-op there.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/index.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/index.ts src/ui/theme/index.test.ts
git commit -m "feat(ui): add aggregated theme barrel"
```

---

### Task 8: `useAppFonts` hook

Wraps `expo-font`'s `useFonts` with exactly the six faces the typography tokens reference. The test mocks `expo-font` so it runs without native modules.

**Files:**

- Create: `src/ui/theme/use-app-fonts.ts`
- Test: `src/ui/theme/use-app-fonts.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/ui/theme/use-app-fonts.test.ts
const mockUseFonts = jest.fn(() => [true, null]);
jest.mock('expo-font', () => ({ useFonts: (map: Record<string, unknown>) => mockUseFonts(map) }));

import { useAppFonts } from './use-app-fonts';

describe('useAppFonts', () => {
  it('carga las seis fuentes que referencian los tokens tipográficos', () => {
    const [loaded] = useAppFonts();
    expect(loaded).toBe(true);

    const passedMap = mockUseFonts.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(passedMap).sort()).toEqual(
      [
        'SpaceGrotesk_500Medium',
        'SpaceGrotesk_700Bold',
        'Inter_400Regular',
        'Inter_500Medium',
        'Inter_600SemiBold',
        'Inter_700Bold',
      ].sort(),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/theme/use-app-fonts.test.ts`
Expected: FAIL — "Cannot find module './use-app-fonts'".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/ui/theme/use-app-fonts.ts
import { useFonts } from 'expo-font';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/**
 * Carga las fuentes de la app. Las claves son los nombres con los que React
 * Native resuelve cada fuente y DEBEN coincidir con fontFamily en typography.ts.
 * Devuelve [loaded, error] igual que useFonts.
 */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/theme/use-app-fonts.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/ui/theme/use-app-fonts.ts src/ui/theme/use-app-fonts.test.ts
git commit -m "feat(ui): add useAppFonts hook"
```

---

### Task 9: `AppBackground` component (solid paper)

The canvas every screen sits on. This task paints the solid paper color; the subtle grain overlay is added in Task 11.

**Files:**

- Create: `src/ui/components/app-background.tsx`
- Test: `src/ui/components/app-background.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/ui/components/app-background.test.tsx
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppBackground } from './app-background';
import { theme } from '../theme';

describe('AppBackground', () => {
  it('renderiza los hijos', () => {
    render(
      <AppBackground>
        <Text>Hola campo</Text>
      </AppBackground>,
    );
    expect(screen.getByText('Hola campo')).toBeTruthy();
  });

  it('pinta el fondo con el color papel del tema', () => {
    render(
      <AppBackground>
        <Text>x</Text>
      </AppBackground>,
    );
    const root = screen.getByTestId('app-background');
    const flat = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;
    expect(flat.backgroundColor).toBe(theme.colors.paper);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/ui/components/app-background.test.tsx`
Expected: FAIL — "Cannot find module './app-background'".

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/ui/components/app-background.tsx
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type AppBackgroundProps = {
  children: ReactNode;
};

/** Lienzo de la app: pinta el papel crema bajo todo el contenido. */
export function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View testID="app-background" style={styles.root}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/ui/components/app-background.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/ui/components/app-background.tsx src/ui/components/app-background.test.tsx
git commit -m "feat(ui): add AppBackground paper canvas"
```

---

### Task 10: Wire `App.tsx` — load fonts + proof screen

Replace the Expo starter `App.tsx` with one that loads fonts and renders a proof screen using the tokens directly (raw `Text`, since base components are a later plan). This is the on-device proof that the system renders.

**Files:**

- Modify: `App.tsx` (full replace)

- [ ] **Step 1: Replace `App.tsx`**

```tsx
// App.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AppBackground } from './src/ui/components/app-background';
import { theme, useAppFonts } from './src/ui/theme';

export default function App() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    // Pantalla en blanco con color papel mientras cargan las fuentes.
    return <View style={styles.loading} />;
  }

  return (
    <AppBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <Text style={[theme.textVariants.caption, styles.muted]}>Objetivo</Text>
        <Text style={[theme.textVariants.display, styles.ink]}>143 m</Text>

        <View style={styles.reco}>
          <Text style={[theme.textVariants.labelAccent, styles.accent]}>Tu palo</Text>
          <Text style={[theme.textVariants.clubName, styles.ink]}>Hierro 7</Text>
        </View>

        <Text style={[theme.textVariants.small, styles.muted]}>Carry ajustado hoy: 145 m</Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  screen: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl * 2,
    gap: theme.spacing.sm,
  },
  ink: { color: theme.colors.ink },
  muted: { color: theme.colors.muted },
  accent: { color: theme.colors.accent },
  reco: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
});
```

- [ ] **Step 2: Typecheck + full test suite**

Run: `npm run typecheck && npm test`
Expected: typecheck exits 0; all tests pass (existing domain/storage tests + the new theme/component tests).

- [ ] **Step 3: Launch the app and eyeball it**

Run: `npm start` then open in Expo Go on the iPhone (scan the QR).
Expected: a cream paper screen showing "OBJETIVO", a large "143 m" in Space Grotesk, and an olive-outlined "Hierro 7" card. Confirm the custom fonts render (the digits look geometric, not the system default).

- [ ] **Step 4: Commit**

```bash
git add App.tsx
git commit -m "feat(ui): load fonts and render theme proof screen"
```

---

### Task 11: Subtle paper-grain texture

Add the recycled-paper grain as a low-opacity tiled overlay in `AppBackground`. The grain is a small tileable PNG.

**Files:**

- Create: `assets/paper-texture.png`
- Modify: `src/ui/components/app-background.tsx`
- Modify: `src/ui/components/app-background.test.tsx`

- [ ] **Step 1: Generate a tileable grain PNG**

Run (macOS — install ImageMagick first if needed: `brew install imagemagick`):

```bash
magick -size 160x160 xc:transparent \
  -seed 7 +noise Random -channel A -evaluate multiply 0.10 +channel \
  -fill '#5C4022' -colorize 100 \
  "assets/paper-texture.png"
```

Expected: a 160×160 PNG of faint brown specks on transparency at `assets/paper-texture.png`.

> If ImageMagick is unavailable, substitute any seamless 160×160 brown-grain PNG with transparency. The exact texture is cosmetic; what matters is that it tiles and is faint.

- [ ] **Step 2: Update the test to assert the overlay renders**

Add this test inside the existing `describe('AppBackground', ...)` block in `src/ui/components/app-background.test.tsx`:

```tsx
it('renderiza la capa de textura de papel por encima del fondo', () => {
  render(
    <AppBackground>
      <Text>x</Text>
    </AppBackground>,
  );
  const texture = screen.getByTestId('paper-texture');
  const flat = Array.isArray(texture.props.style)
    ? Object.assign({}, ...texture.props.style)
    : texture.props.style;
  expect(flat.opacity).toBeCloseTo(0.09, 2);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest src/ui/components/app-background.test.tsx`
Expected: FAIL — unable to find an element with testID "paper-texture".

- [ ] **Step 4: Add the texture overlay to `AppBackground`**

Replace the contents of `src/ui/components/app-background.tsx` with:

```tsx
// src/ui/components/app-background.tsx
import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { theme } from '../theme';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const paperTexture = require('../../../assets/paper-texture.png');

type AppBackgroundProps = {
  children: ReactNode;
};

/** Lienzo de la app: papel crema con grano reciclado sutil bajo el contenido. */
export function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View testID="app-background" style={styles.root}>
      <Image
        testID="paper-texture"
        source={paperTexture}
        resizeMode="repeat"
        pointerEvents="none"
        style={styles.texture}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.09,
  },
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/ui/components/app-background.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Verify on device**

Run: `npm start` and reopen in Expo Go.
Expected: the same proof screen, now with a faint speckled grain over the cream — subtle, not competing with the text.

- [ ] **Step 7: Commit**

```bash
git add assets/paper-texture.png src/ui/components/app-background.tsx src/ui/components/app-background.test.tsx
git commit -m "feat(ui): add subtle paper-grain texture to AppBackground"
```

---

## Self-Review

**Spec coverage:**

- §3 Color tokens → Task 3 ✓
- §4 Typography (families + scale, tabular-nums, uppercase) → Tasks 4 + 8 ✓
- §5 Spacing/radius/border → Task 5 ✓
- §6 Paper texture (subtle, tileable PNG, opacity ≈0.09, under content) → Task 11 ✓
- §7 Iconography (Feather outline name map) → Task 6 ✓
- §9 `src/ui/theme/` structure + aggregated theme + re-exports → Task 7 ✓
- §11 "concretar en el plan": texture asset (Task 11), font loading + splash-while-loading (Task 8 + Task 10 loading view) ✓
- **Out of scope by design (separate plan):** base components in §8 except `AppBackground`. Touch-target sizing and exact line-heights/letter-spacing per-token will be revisited in the components plan where they bite. Noted, not a gap.

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to". Every code step shows complete code. The only conditional note (Task 7 re-export ordering) is explicit and actionable.

**Type consistency:** `theme` keys (`colors`, `textVariants`, `fontFamily`, `spacing`, `radius`, `border`, `icons`) are identical in Task 7 definition and its test. `useAppFonts` returns `[boolean, Error | null]` and `App.tsx` destructures `[fontsLoaded]` accordingly. `fontFamily.display === 'SpaceGrotesk_700Bold'` (Task 4) matches a key passed to `useFonts` (Task 8). `withOpacity` is defined (Task 2) and available but, after review, the texture overlay uses RN's `opacity` style instead — `withOpacity` remains a valid utility for future translucent fills and is exercised by its own tests, so no dangling reference.
