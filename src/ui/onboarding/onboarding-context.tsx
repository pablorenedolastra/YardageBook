import { createContext, use, useState, type ReactNode } from 'react';
import { ProfileDraft } from '../../domain';

interface OnboardingState {
  /** Draft del perfil recogido en el Paso 1 (null hasta completarlo). */
  draft: ProfileDraft | null;
  setDraft: (draft: ProfileDraft) => void;
}

const OnboardingContext = createContext<OnboardingState | null>(null);

/** Mantiene en memoria el draft del perfil mientras dura el onboarding. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  return <OnboardingContext value={{ draft, setDraft }}>{children}</OnboardingContext>;
}

/** Acceso al draft del onboarding. Debe usarse dentro de OnboardingProvider. */
export function useOnboardingDraft(): OnboardingState {
  const ctx = use(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboardingDraft debe usarse dentro de OnboardingProvider');
  }
  return ctx;
}
