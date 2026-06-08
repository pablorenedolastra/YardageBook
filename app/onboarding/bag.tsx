import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { createAppRepository } from '../../src/services/storage';
import { createId } from '../../src/services/id';
import { BagEditor } from '../../src/ui/components/bag-editor';
import { PrimaryButton } from '../../src/ui/components/primary-button';
import { StepProgress } from '../../src/ui/components/step-progress';
import { emptyBag, isBagValid, toClubMatrix, type BagDraft } from '../../src/ui/forms/bag-form';
import { useOnboardingDraft } from '../../src/ui/onboarding/onboarding-context';
import { theme } from '../../src/ui/theme';

export default function OnboardingBag() {
  const router = useRouter();
  const { draft } = useOnboardingDraft();
  const [bag, setBag] = useState<BagDraft>(() => emptyBag(new Date().getMonth() + 1));
  const [saving, setSaving] = useState(false);

  // Si se entra directo a este paso sin perfil, volver al Paso 1.
  if (!draft) {
    return <Redirect href="/onboarding" />;
  }

  const onStart = async () => {
    if (!isBagValid(bag) || saving) return;
    setSaving(true);
    try {
      const repo = createAppRepository();
      await repo.saveProfile({ id: createId(), ...draft });
      await repo.saveMatrix(toClubMatrix(bag));
      router.replace('/(tabs)');
    } catch {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
    >
      <StepProgress step={2} total={2} />
      <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Tu bolsa</Text>
      <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
        Añade tus palos y la distancia de carry de cada uno. Indica en qué mes y ciudad los mediste.
      </Text>

      <BagEditor value={bag} onChange={setBag} />

      <PrimaryButton
        title={saving ? 'Guardando…' : 'Empezar a jugar'}
        onPress={onStart}
        disabled={!isBagValid(bag) || saving}
      />
    </ScrollView>
  );
}
