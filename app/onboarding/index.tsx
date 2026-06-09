import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { AppBackground } from '../../src/ui/components/app-background';
import { ProfileForm } from '../../src/ui/components/profile-form';
import { StepProgress } from '../../src/ui/components/step-progress';
import { toProfileDraft, type ProfileFormValues } from '../../src/ui/forms/profile-form';
import { useOnboardingDraft } from '../../src/ui/onboarding/onboarding-context';
import { theme } from '../../src/ui/theme';

const INITIAL: ProfileFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  handicap: '',
  unit: 'meters',
};

export default function OnboardingProfile() {
  const router = useRouter();
  const { setDraft } = useOnboardingDraft();

  const onSubmit = (values: ProfileFormValues) => {
    setDraft(toProfileDraft(values));
    router.push('/onboarding/bag');
  };

  return (
    <AppBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
      >
        <StepProgress step={1} total={2} />
        <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Tu perfil</Text>
        <ProfileForm initialValues={INITIAL} submitLabel="Continuar" onSubmit={onSubmit} />
      </ScrollView>
    </AppBackground>
  );
}
