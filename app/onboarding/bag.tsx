import { ScreenPlaceholder } from '../../src/ui/components/screen-placeholder';
import { useOnboardingDraft } from '../../src/ui/onboarding/onboarding-context';

export default function OnboardingBag() {
  const { draft } = useOnboardingDraft();
  return (
    <ScreenPlaceholder
      title="Tu bolsa"
      subtitle={
        draft
          ? `Perfil de ${draft.firstName} listo. El editor de bolsa llega en el siguiente incremento.`
          : 'Vuelve al paso anterior para crear tu perfil.'
      }
    />
  );
}
