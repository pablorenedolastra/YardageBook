import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ClubMatrix, Profile } from '../../src/domain';
import { createAppRepository } from '../../src/services/storage';
import { BagEditor } from '../../src/ui/components/bag-editor';
import { PrimaryButton } from '../../src/ui/components/primary-button';
import { SecondaryButton } from '../../src/ui/components/secondary-button';
import {
  bagFromMatrix,
  isBagValid,
  toClubMatrix,
  type BagDraft,
} from '../../src/ui/forms/bag-form';
import { monthName } from '../../src/ui/forms/months';
import { unitLabel } from '../../src/ui/forms/units-format';
import { theme } from '../../src/ui/theme';

type Mode = 'view' | 'edit';

export default function YardageBookTab() {
  const [matrix, setMatrix] = useState<ClubMatrix | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('view');
  const [draft, setDraft] = useState<BagDraft | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const repo = createAppRepository();
      setLoading(true);
      Promise.all([repo.loadMatrix(), repo.loadProfile()]).then(([m, p]) => {
        if (!active) return;
        setMatrix(m);
        setProfile(p);
        setLoading(false);
        setMode('view');
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const unit = profile ? unitLabel(profile.unit) : 'm';

  const startEdit = () => {
    if (!matrix) return;
    setDraft(bagFromMatrix(matrix));
    setMode('edit');
  };

  const save = async () => {
    if (!draft || !isBagValid(draft)) return;
    const next = toClubMatrix(draft);
    await createAppRepository().saveMatrix(next);
    setMatrix(next);
    setMode('view');
  };

  if (loading) {
    return <View style={{ flex: 1 }} />;
  }

  if (mode === 'edit' && draft) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
      >
        <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Editar bolsa</Text>
        <BagEditor value={draft} onChange={setDraft} />
        <PrimaryButton title="Guardar bolsa" onPress={save} disabled={!isBagValid(draft)} />
        <SecondaryButton title="Cancelar" onPress={() => setMode('view')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}
    >
      <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Yardage Book</Text>

      {matrix && matrix.entries.length > 0 ? (
        <>
          <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
            Medido en {monthName(matrix.measuredContext.month)}
            {matrix.measuredContext.city ? ` · ${matrix.measuredContext.city}` : ''}
          </Text>
          <View>
            {matrix.entries.map((entry) => (
              <View
                key={entry.clubId}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: theme.spacing.md,
                  borderBottomWidth: theme.border.hairline,
                  borderBottomColor: theme.colors.line,
                }}
              >
                <Text style={[theme.textVariants.body, { color: theme.colors.ink }]}>
                  {entry.label}
                </Text>
                <Text
                  style={[
                    theme.textVariants.bodyStrong,
                    { color: theme.colors.ink, fontVariant: ['tabular-nums'] },
                  ]}
                >
                  {entry.carryDistance} {unit}
                </Text>
              </View>
            ))}
          </View>
          <PrimaryButton title="Editar bolsa" onPress={startEdit} />
        </>
      ) : (
        <Text style={[theme.textVariants.body, { color: theme.colors.muted }]}>
          Aún no tienes palos en tu bolsa.
        </Text>
      )}
    </ScrollView>
  );
}
