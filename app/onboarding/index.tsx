import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CountryPicker } from '../../src/ui/components/country-picker';
import { PrimaryButton } from '../../src/ui/components/primary-button';
import { SegmentedControl } from '../../src/ui/components/segmented-control';
import { StepProgress } from '../../src/ui/components/step-progress';
import { TextField } from '../../src/ui/components/text-field';
import {
  isProfileFormValid,
  toProfileDraft,
  validateProfileForm,
  type ProfileFormValues,
} from '../../src/ui/forms/profile-form';
import { useOnboardingDraft } from '../../src/ui/onboarding/onboarding-context';
import { theme } from '../../src/ui/theme';

const UNIT_OPTIONS = [
  { label: 'Metros', value: 'meters' as const },
  { label: 'Yardas', value: 'yards' as const },
];

type FieldKey = 'firstName' | 'lastName' | 'email' | 'country' | 'handicap';

export default function OnboardingProfile() {
  const router = useRouter();
  const { setDraft } = useOnboardingDraft();
  const [values, setValues] = useState<ProfileFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    handicap: '',
    unit: 'meters',
  });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  const errors = validateProfileForm(values);
  const valid = isProfileFormValid(values);

  const set = (key: FieldKey, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const markTouched = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));
  const errorFor = (key: FieldKey) => (touched[key] ? errors[key] : undefined);

  const onContinue = () => {
    if (!valid) return;
    setDraft(toProfileDraft(values));
    router.push('/onboarding/bag');
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
    >
      <StepProgress step={1} total={2} />
      <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Tu perfil</Text>

      <TextField
        label="Nombre"
        placeholder="Tu nombre"
        value={values.firstName}
        onChangeText={(t) => set('firstName', t)}
        onBlur={() => markTouched('firstName')}
        error={errorFor('firstName')}
        autoCapitalize="words"
      />
      <TextField
        label="Apellidos"
        placeholder="Tus apellidos"
        value={values.lastName}
        onChangeText={(t) => set('lastName', t)}
        onBlur={() => markTouched('lastName')}
        error={errorFor('lastName')}
        autoCapitalize="words"
      />
      <TextField
        label="Email"
        placeholder="tu@email.com"
        value={values.email}
        onChangeText={(t) => set('email', t)}
        onBlur={() => markTouched('email')}
        error={errorFor('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <CountryPicker
        label="País"
        value={values.country}
        onChange={(code) => {
          set('country', code);
          markTouched('country');
        }}
        error={errorFor('country')}
      />
      <TextField
        label="Hándicap (opcional)"
        placeholder="Ej. 18,4"
        value={values.handicap}
        onChangeText={(t) => set('handicap', t)}
        onBlur={() => markTouched('handicap')}
        error={errorFor('handicap')}
        keyboardType="decimal-pad"
      />

      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>Unidades</Text>
        <SegmentedControl
          options={UNIT_OPTIONS}
          value={values.unit}
          onChange={(unit) => setValues((v) => ({ ...v, unit }))}
        />
      </View>

      <PrimaryButton title="Continuar" onPress={onContinue} disabled={!valid} />
    </ScrollView>
  );
}
