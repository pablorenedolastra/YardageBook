import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { DistanceUnit, Profile } from '../../src/domain';
import { createAppRepository } from '../../src/services/storage';
import { AppBackground } from '../../src/ui/components/app-background';
import { PrimaryButton } from '../../src/ui/components/primary-button';
import { ProfileForm } from '../../src/ui/components/profile-form';
import { SecondaryButton } from '../../src/ui/components/secondary-button';
import { SegmentedControl } from '../../src/ui/components/segmented-control';
import { countryName } from '../../src/ui/forms/countries';
import {
  profileToFormValues,
  toProfileDraft,
  type ProfileFormValues,
} from '../../src/ui/forms/profile-form';
import { theme } from '../../src/ui/theme';

const UNIT_OPTIONS = [
  { label: 'Metros', value: 'meters' as const },
  { label: 'Yardas', value: 'yards' as const },
];

function initials(p: Profile): string {
  return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: theme.border.hairline,
        borderBottomColor: theme.colors.line,
      }}
    >
      <Text style={[theme.textVariants.body, { color: theme.colors.muted }]}>{label}</Text>
      <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.ink }]}>{value}</Text>
    </View>
  );
}

export default function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      createAppRepository()
        .loadProfile()
        .then((p) => {
          if (!active) return;
          setProfile(p);
          setLoading(false);
          setEditing(false);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const persist = async (next: Profile) => {
    setProfile(next);
    await createAppRepository().saveProfile(next);
  };

  const changeUnit = (unit: DistanceUnit) => {
    if (!profile) return;
    void persist({ ...profile, unit });
  };

  const saveEdit = (values: ProfileFormValues) => {
    if (!profile) return;
    void persist({ id: profile.id, ...toProfileDraft(values) });
    setEditing(false);
  };

  if (loading) {
    return (
      <AppBackground>
        <View style={{ flex: 1 }} />
      </AppBackground>
    );
  }

  if (!profile) {
    return (
      <AppBackground>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.xl }}>
          <Text style={[theme.textVariants.body, { color: theme.colors.muted }]}>
            No hay perfil guardado.
          </Text>
        </ScrollView>
      </AppBackground>
    );
  }

  if (editing) {
    return (
      <AppBackground>
        <ScrollView
          style={{ flex: 1 }}
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
        >
          <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>
            Editar perfil
          </Text>
          <ProfileForm
            initialValues={profileToFormValues(profile)}
            submitLabel="Guardar"
            onSubmit={saveEdit}
          />
          <SecondaryButton title="Cancelar" onPress={() => setEditing(false)} />
        </ScrollView>
      </AppBackground>
    );
  }

  return (
    <AppBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: theme.border.hairline,
              borderColor: theme.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[theme.textVariants.titleApp, { color: theme.colors.accent }]}>
              {initials(profile)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
              {profile.email}
            </Text>
          </View>
          {profile.handicap !== undefined ? (
            <View
              style={{
                borderWidth: theme.border.hairline,
                borderColor: theme.colors.accent,
                borderRadius: theme.radius.pill,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
              }}
            >
              <Text style={[theme.textVariants.caption, { color: theme.colors.accent }]}>
                HCP {profile.handicap}
              </Text>
            </View>
          ) : null}
        </View>

        <View>
          <Row label="Nombre" value={profile.firstName} />
          <Row label="Apellidos" value={profile.lastName} />
          <Row label="País" value={countryName(profile.country)} />
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>Unidades</Text>
          <SegmentedControl options={UNIT_OPTIONS} value={profile.unit} onChange={changeUnit} />
        </View>

        <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
          Tus datos se guardan solo en este móvil. Sin cuenta ni nube.
        </Text>

        <PrimaryButton title="Editar perfil" onPress={() => setEditing(true)} />
      </ScrollView>
    </AppBackground>
  );
}
