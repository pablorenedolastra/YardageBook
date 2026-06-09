# YardageBook UX — Incremento 2: Formularios + Onboarding Paso 1 + modelo Profile

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development / executing-plans.

**Goal:** Actualizar el modelo `Profile` (campos del spec UX §7), construir los componentes de formulario del sistema de diseño y la pantalla de **Onboarding Paso 1 (Perfil)** rellenable, con validación. El draft del perfil se lleva al Paso 2 vía contexto (la persistencia ocurre al final del Paso 2, Inc.3).

**Architecture:** `domain` gana los campos de `Profile` + tipo `ProfileDraft`. Validación de formulario como función pura testeable en `src/ui/forms`. Componentes en `src/ui/components` (tokens del tema, cero literales). Onboarding pasa a ruta de carpeta `app/onboarding/` (Stack) con un contexto en memoria para el draft entre pasos.

**Refs:** [UX screens](../specs/2026-06-03-yardagebook-ux-screens.md) §5.1 · [Design system](../specs/2026-06-02-yardagebook-design-system.md) §8.

---

## Estructura de ficheros

```
src/domain/models/profile.ts        (modify) → Profile nuevo + ProfileDraft
src/services/storage/app-repository.test.ts (modify) → fixture nueva

src/ui/forms/
├── countries.ts                     ← lista curada de países (v1)
├── profile-form.ts                  ← ProfileFormValues, validateProfileForm, toProfileDraft
└── profile-form.test.ts

src/ui/components/
├── text-field.tsx (+ test)
├── segmented-control.tsx (+ test)
├── primary-button.tsx (+ test)
├── country-picker.tsx (+ test)
└── step-progress.tsx

src/ui/onboarding/onboarding-context.tsx   ← OnboardingProvider + useOnboardingDraft

app/onboarding.tsx                    (eliminar)
app/onboarding/
├── _layout.tsx                       ← Stack + OnboardingProvider
├── index.tsx                         ← Paso 1: formulario de perfil
└── bag.tsx                           ← Paso 2 placeholder (Inc.3)
```

---

## Task 1: Modelo Profile + ProfileDraft

- [ ] **profile.ts**:

```ts
import { DistanceUnit } from './units';

/** Perfil del jugador. Vive solo en el dispositivo. */
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Código o nombre de país. */
  country: string;
  /** Hándicap (admite decimales). Opcional. */
  handicap?: number;
  /** Unidad de todas las distancias del perfil. */
  unit: DistanceUnit;
}

/** Perfil sin id, tal cual se recoge en el formulario antes de persistir. */
export type ProfileDraft = Omit<Profile, 'id'>;
```

- [ ] **app-repository.test.ts**: cambiar el fixture a

```ts
const profile: Profile = {
  id: 'p1',
  firstName: 'Pablo',
  lastName: 'Renedo',
  email: 'pablo@example.com',
  country: 'ES',
  handicap: 12.4,
  unit: 'meters',
};
```

- [ ] typecheck + `npx jest src/services/storage` (verde) → commit `feat(domain): expand Profile model (name, email, country, handicap)`

---

## Task 2: Validación de formulario (pura, TDD)

**Files:** `src/ui/forms/profile-form.ts`, `src/ui/forms/profile-form.test.ts`

- [ ] **test (rojo)** cubre: válido completo; faltan obligatorios (firstName/lastName/email/country); email mal formado; handicap fuera de rango (-10..54); handicap vacío = OK; `toProfileDraft` parsea coma decimal y omite handicap vacío.
- [ ] **impl** `profile-form.ts`:

```ts
import { DistanceUnit, ProfileDraft } from '../../domain';

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  handicap: string;
  unit: DistanceUnit;
}

export type ProfileFormErrors = Partial<Record<keyof Omit<ProfileFormValues, 'unit'>, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDICAP_MIN = -10;
const HANDICAP_MAX = 54;

export function validateProfileForm(v: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (!v.firstName.trim()) errors.firstName = 'Introduce tu nombre';
  if (!v.lastName.trim()) errors.lastName = 'Introduce tus apellidos';
  if (!v.email.trim()) errors.email = 'Introduce tu email';
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Email no válido';
  if (!v.country.trim()) errors.country = 'Selecciona tu país';
  if (v.handicap.trim()) {
    const h = Number(v.handicap.replace(',', '.'));
    if (Number.isNaN(h)) errors.handicap = 'Hándicap no válido';
    else if (h < HANDICAP_MIN || h > HANDICAP_MAX)
      errors.handicap = `Hándicap entre ${HANDICAP_MIN} y ${HANDICAP_MAX}`;
  }
  return errors;
}

export function isProfileFormValid(v: ProfileFormValues): boolean {
  return Object.keys(validateProfileForm(v)).length === 0;
}

export function toProfileDraft(v: ProfileFormValues): ProfileDraft {
  const handicap = v.handicap.trim() ? Number(v.handicap.replace(',', '.')) : undefined;
  return {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    email: v.email.trim(),
    country: v.country.trim(),
    handicap,
    unit: v.unit,
  };
}
```

- [ ] verde → commit `feat(forms): add profile form validation`

---

## Task 3: Componentes de formulario

`TextField`, `SegmentedControl`, `PrimaryButton` (tokens del tema). Cada uno con test de humo (render + interacción básica). Detalle de estilo en el sistema de diseño §8. Commit `feat(ui): add TextField, SegmentedControl, PrimaryButton`.

## Task 4: CountryPicker + lista de países

`countries.ts` (lista curada v1: España + países de golf/UE comunes, `{ code, name }`). `CountryPicker`: pressable que abre un modal con buscador y `FlatList`. Test de humo (abre modal, selecciona). Commit `feat(ui): add CountryPicker with curated country list`.

## Task 5: StepProgress + contexto + pantalla Paso 1

- `StepProgress` (Paso n de N).
- `onboarding-context.tsx`: `OnboardingProvider` con `draft`/`setDraft` en memoria + hook `useOnboardingDraft`.
- `app/onboarding/_layout.tsx`: Stack + provider. `app/onboarding/index.tsx`: formulario que usa los componentes, valida, en "Continuar" guarda el draft en contexto y navega a `/onboarding/bag`. `app/onboarding/bag.tsx`: placeholder Paso 2 (muestra el nombre del draft como prueba).
- Eliminar `app/onboarding.tsx`.
- Commit `feat(onboarding): add step 1 profile screen with validation`.

## Task 6: Verificación

`npm run typecheck && npm run lint && npm test` (verde) + `npx expo export --platform web` sin errores. Commit final si procede.

---

## Definición de "hecho"

- [ ] `Profile` actualizado + `ProfileDraft`; storage verde con el nuevo fixture.
- [ ] Validación pura testeada.
- [ ] Pantalla de Paso 1 rellenable; "Continuar" deshabilitado hasta validez; navega al Paso 2 con el draft en contexto.
- [ ] typecheck/lint/test verdes; export web sin errores.

## Fuera de alcance

- Persistencia de Profile/ClubMatrix (ocurre al final del Paso 2 — Inc.3).
- BagEditor / ClubPickerSheet (Inc.3).
- Lista de países completa (v1 usa lista curada; ampliable).
