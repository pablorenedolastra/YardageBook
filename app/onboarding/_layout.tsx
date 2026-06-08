import { Stack } from 'expo-router';
import { OnboardingProvider } from '../../src/ui/onboarding/onboarding-context';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
      />
    </OnboardingProvider>
  );
}
