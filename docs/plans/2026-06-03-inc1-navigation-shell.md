# YardageBook UX — Incremento 1: Shell de navegación

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development / executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Convertir la app a **expo-router** con 3 pestañas (Juego, Yardage Book, Perfil) usando una `TabBar` a medida (sistema de diseño papel/oliva), y un _gating_ de onboarding: si no hay perfil guardado se va a Onboarding; si lo hay, a las pestañas. Pantallas placeholder, visible en preview web.

**Architecture:** Routing por archivos con `expo-router`. La raíz `app/_layout.tsx` carga fuentes y envuelve todo en `AppBackground`. `app/index.tsx` decide la ruta inicial leyendo `AppRepository.loadProfile()`. Las pestañas usan `Tabs` de expo-router con `tabBar` personalizada (no tabs nativas, para honrar el diseño y funcionar en web). Iconos Feather (`@expo/vector-icons`), tokens del tema, cero literales.

**Tech Stack:** expo-router (SDK 56), react-native-safe-area-context, @testing-library/react-native, Jest.

**Refs:** [UX screens](../specs/2026-06-03-yardagebook-ux-screens.md) §4 · [Design system](../specs/2026-06-02-yardagebook-design-system.md) §8 (`TabBar`).

---

## Estructura de ficheros

```
app/
├── _layout.tsx            ← raíz: fuentes + AppBackground + Stack (index, onboarding, (tabs))
├── index.tsx              ← gate: loadProfile → Redirect a (tabs) u onboarding
├── onboarding.tsx         ← placeholder (Inc.2/3 lo desarrollan)
└── (tabs)/
    ├── _layout.tsx        ← Tabs con tabBar={<TabBar/>}; 3 pantallas
    ├── index.tsx          ← Juego (placeholder)
    ├── yardage-book.tsx   ← Yardage Book (placeholder)
    └── profile.tsx        ← Perfil (placeholder)

src/ui/components/
├── tab-bar.tsx            ← TabBar a medida (borde superior line, icono Feather, activo accent)
└── tab-bar.test.tsx

src/ui/components/screen-placeholder.tsx   ← bloque reutilizable para placeholders
src/services/storage/index.ts              ← + createAppRepository()
```

`App.tsx` y `index.ts` (raíz) se eliminan: el entry pasa a `expo-router/entry`.

---

## Task 1: Instalar y configurar expo-router

**Files:** `package.json` (main + dep), `app.json` (plugin + scheme)

- [ ] **Step 1: Instalar expo-router y peers**

Run:

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants
```

Expected: añade las dependencias con versiones compatibles con SDK 56.

- [ ] **Step 2: Cambiar el entry en `package.json`**

Cambia `"main": "index.ts"` por:

```json
"main": "expo-router/entry"
```

- [ ] **Step 3: Configurar `app.json`** (añadir `expo-router` a plugins y un `scheme`)

`plugins` pasa a `["expo-font", "expo-router"]` y se añade `"scheme": "yardagebook"` dentro de `"expo"`:

```json
"scheme": "yardagebook",
"plugins": ["expo-font", "expo-router"]
```

- [ ] **Step 4: Eliminar el entry antiguo**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && rm index.ts App.tsx
```

- [ ] **Step 5: Commit** (aún no arranca; se completa en Task 4)

```bash
git add -A && git commit -m "build(nav): install expo-router and switch entry point"
```

---

## Task 2: Extender iconos + componente TabBar (TDD)

**Files:** `src/ui/theme/icons.ts` (modify), `src/ui/components/tab-bar.tsx`, `src/ui/components/tab-bar.test.tsx`

- [ ] **Step 1: Añadir iconos de pestañas a `src/ui/theme/icons.ts`**

Dentro del objeto `icons`, añade (Feather válidos):

```ts
  game: 'flag',
  yardageBook: 'book-open',
```

- [ ] **Step 2: Escribir el test que falla** — `src/ui/components/tab-bar.test.tsx`

```tsx
import { render } from '@testing-library/react-native';
import { TabBar } from './tab-bar';

// Estado mínimo simulando las props de expo-router Tabs.
function makeProps(activeIndex: number) {
  const routes = [
    { key: 'index', name: 'index' },
    { key: 'yardage-book', name: 'yardage-book' },
    { key: 'profile', name: 'profile' },
  ];
  return {
    state: { index: activeIndex, routes },
    navigation: { navigate: () => {}, emit: () => ({ defaultPrevented: false }) },
    descriptors: routes.reduce(
      (acc, r) => {
        acc[r.key] = { options: {} };
        return acc;
      },
      {} as Record<string, { options: object }>,
    ),
  } as never;
}

describe('TabBar', () => {
  it('muestra las tres etiquetas de pestaña', () => {
    const { getByText } = render(<TabBar {...makeProps(0)} />);
    expect(getByText('Juego')).toBeTruthy();
    expect(getByText('Yardage Book')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Ejecutar y ver que falla**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/ui/components/tab-bar.test.tsx
```

Expected: FAIL — "Cannot find module './tab-bar'".

- [ ] **Step 4: Implementar `src/ui/components/tab-bar.tsx`**

```tsx
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

/** Configuración visible de cada pestaña, en orden. */
const TABS: { name: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { name: 'index', label: 'Juego', icon: theme.icons.game },
  { name: 'yardage-book', label: 'Yardage Book', icon: theme.icons.yardageBook },
  { name: 'profile', label: 'Perfil', icon: theme.icons.profile },
];

/** Barra de pestañas a medida (sistema de diseño): borde superior `line`,
 * iconos Feather de contorno, pestaña activa en `accent`. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: theme.border.hairline,
        borderTopColor: theme.colors.line,
        backgroundColor: theme.colors.paper,
        paddingBottom: insets.bottom,
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = state.index === index;
        const color = isActive ? theme.colors.accent : theme.colors.ink;
        const route = state.routes[index];
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', paddingVertical: theme.spacing.sm, gap: 2 }}
          >
            <Feather name={tab.icon} size={20} color={color} />
            <Text style={[theme.textVariants.caption, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 5: Ejecutar y ver que pasa**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx jest src/ui/components/tab-bar.test.tsx
```

Expected: PASS, 1 test.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(nav): add custom TabBar component"
```

---

## Task 3: Factory de repositorio + placeholder reutilizable

**Files:** `src/services/storage/index.ts` (modify), `src/ui/components/screen-placeholder.tsx`

- [ ] **Step 1: Añadir factory a `src/services/storage/index.ts`**

Al final del barrel, añade:

```ts
import { AppRepository } from './app-repository';
import { AsyncStorageStore } from './async-storage-store';

/** Crea el repositorio de la app respaldado por AsyncStorage (dispositivo). */
export function createAppRepository(): AppRepository {
  return new AppRepository(new AsyncStorageStore());
}
```

- [ ] **Step 2: Crear `src/ui/components/screen-placeholder.tsx`**

```tsx
import { Text, View } from 'react-native';
import { theme } from '../theme';

/** Placeholder de pantalla mientras se construye el contenido real. */
export function ScreenPlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>{title}</Text>
      {subtitle ? (
        <Text
          style={[theme.textVariants.small, { color: theme.colors.muted, textAlign: 'center' }]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm run typecheck
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(nav): add app repository factory and screen placeholder"
```

---

## Task 4: Rutas expo-router (raíz, gate, tabs, placeholders)

**Files:** `app/_layout.tsx`, `app/index.tsx`, `app/onboarding.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/yardage-book.tsx`, `app/(tabs)/profile.tsx`

- [ ] **Step 1: `app/_layout.tsx`** (fuentes + fondo + Stack)

```tsx
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppBackground } from '../src/ui/components/app-background';
import { theme, useAppFonts } from '../src/ui/theme';

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.colors.paper }} />;
  }
  return (
    <SafeAreaProvider>
      <AppBackground>
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
        />
      </AppBackground>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: `app/index.tsx`** (gate de onboarding)

```tsx
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { theme } from '../src/ui/theme';
import { createAppRepository } from '../src/services/storage';

type GateState = 'loading' | 'tabs' | 'onboarding';

export default function Index() {
  const [state, setState] = useState<GateState>('loading');
  useEffect(() => {
    createAppRepository()
      .loadProfile()
      .then((profile) => setState(profile ? 'tabs' : 'onboarding'))
      .catch(() => setState('onboarding'));
  }, []);

  if (state === 'loading') {
    return <View style={{ flex: 1, backgroundColor: theme.colors.paper }} />;
  }
  return <Redirect href={state === 'tabs' ? '/(tabs)' : '/onboarding'} />;
}
```

- [ ] **Step 3: `app/onboarding.tsx`** (placeholder)

```tsx
import { ScreenPlaceholder } from '../src/ui/components/screen-placeholder';

export default function Onboarding() {
  return (
    <ScreenPlaceholder
      title="Bienvenido a YardageBook"
      subtitle="Aquí irá el onboarding (perfil + bolsa). Se construye en el siguiente incremento."
    />
  );
}
```

- [ ] **Step 4: `app/(tabs)/_layout.tsx`** (Tabs + tabBar a medida)

```tsx
import { Tabs } from 'expo-router';
import { TabBar } from '../../src/ui/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Juego' }} />
      <Tabs.Screen name="yardage-book" options={{ title: 'Yardage Book' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
```

- [ ] **Step 5: Las tres pantallas placeholder**

`app/(tabs)/index.tsx`:

```tsx
import { ScreenPlaceholder } from '../../src/ui/components/screen-placeholder';

export default function GameTab() {
  return (
    <ScreenPlaceholder
      title="Juego"
      subtitle="Selección de campo y mapa del hoyo (próximos incrementos)."
    />
  );
}
```

`app/(tabs)/yardage-book.tsx`:

```tsx
import { ScreenPlaceholder } from '../../src/ui/components/screen-placeholder';

export default function YardageBookTab() {
  return (
    <ScreenPlaceholder title="Yardage Book" subtitle="Tu bolsa de palos (próximo incremento)." />
  );
}
```

`app/(tabs)/profile.tsx`:

```tsx
import { ScreenPlaceholder } from '../../src/ui/components/screen-placeholder';

export default function ProfileTab() {
  return <ScreenPlaceholder title="Perfil" subtitle="Tus datos (próximo incremento)." />;
}
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(nav): add expo-router routes (gate, tabs, placeholders)"
```

---

## Task 5: Verificación final

- [ ] **Step 1: typecheck + lint + tests**

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npm run typecheck && npm run lint && npm test
```

Expected: typecheck exit 0; lint sin errores; Jest PASS (40 tests: los 39 previos + 1 de TabBar).

- [ ] **Step 2: Arranque web (humo)** — confirma que el bundler compila la app router sin errores

```bash
cd "/Users/parenedo/Claude PRL/YardageBook" && npx expo export --platform web 2>&1 | tail -20
```

Expected: "Exported" sin errores de bundling (valida que las rutas y dependencias resuelven). Borra la salida si se genera: `rm -rf dist`.

- [ ] **Step 3: Commit (si Step 2 generó algún ajuste)** y fin.

---

## Definición de "hecho"

- [ ] La app arranca con expo-router: `/` redirige a onboarding (sin perfil) o a las pestañas (con perfil).
- [ ] 3 pestañas con TabBar a medida (papel/oliva, iconos Feather, activa en accent).
- [ ] `npm run typecheck`, `npm run lint`, `npm test` (40) en verde.
- [ ] `npx expo export --platform web` compila sin errores.
- [ ] `App.tsx`/`index.ts` antiguos eliminados.

## Fuera de alcance (próximos incrementos)

- Contenido real de onboarding/pestañas (Inc. 2-7).
- Cambios de modelo `Profile`/`ClubMatrix` (Inc. 2 y 3).
