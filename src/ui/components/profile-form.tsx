import { useState } from 'react';
import { Text, View } from 'react-native';
import {
  isProfileFormValid,
  validateProfileForm,
  type ProfileFormValues,
} from '../forms/profile-form';
import { CountryPicker } from './country-picker';
import { PrimaryButton } from './primary-button';
import { SegmentedControl } from './segmented-control';
import { TextField } from './text-field';
import { theme } from '../theme';

const UNIT_OPTIONS = [
  { label: 'Metros', value: 'meters' as const },
  { label: 'Yardas', value: 'yards' as const },
];

type FieldKey = 'firstName' | 'lastName' | 'email' | 'country' | 'handicap';

export interface ProfileFormProps {
  initialValues: ProfileFormValues;
  submitLabel: string;
  onSubmit: (values: ProfileFormValues) => void;
}

/** Formulario de perfil reutilizable (onboarding paso 1 y edición de perfil). */
export function ProfileForm({ initialValues, submitLabel, onSubmit }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});

  const errors = validateProfileForm(values);
  const valid = isProfileFormValid(values);

  const set = (key: FieldKey, value: string) => setValues((v) => ({ ...v, [key]: value }));
  const markTouched = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));
  const errorFor = (key: FieldKey) => (touched[key] ? errors[key] : undefined);

  return (
    <View style={{ gap: theme.spacing.lg }}>
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

      <PrimaryButton title={submitLabel} onPress={() => onSubmit(values)} disabled={!valid} />
    </View>
  );
}
