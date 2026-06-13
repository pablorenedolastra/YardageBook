import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  addClubFromCatalog,
  addCustomClub,
  removeEntry,
  setEntryDistance,
  validateBag,
  type BagDraft,
} from '../forms/bag-form';
import { ClubPickerSheet } from './club-picker-sheet';
import { MonthPicker } from './month-picker';
import { theme } from '../theme';

export interface BagEditorProps {
  value: BagDraft;
  onChange: (bag: BagDraft) => void;
}

/** Editor de bolsa reutilizable (onboarding y Yardage Book). Controlado. */
export function BagEditor({ value, onChange }: BagEditorProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { entryErrors } = validateBag(value);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <View style={{ flex: 1 }}>
          <MonthPicker
            label="Mes de medición"
            value={value.month}
            onChange={(month) => onChange({ ...value, month })}
          />
        </View>
        <View style={{ flex: 1, gap: theme.spacing.xs }}>
          <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>Ciudad</Text>
          <TextInput
            placeholder="Ciudad"
            placeholderTextColor={theme.colors.muted}
            value={value.city}
            onChangeText={(city) => onChange({ ...value, city })}
            style={[
              theme.textVariants.body,
              {
                color: theme.colors.ink,
                borderWidth: theme.border.hairline,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.sm,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              },
            ]}
          />
        </View>
      </View>

      {value.entries.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>
            Distancias de carry
          </Text>
          <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
            Indica lo que vuela la bola con cada palo, en tu unidad.
          </Text>
        </View>
      ) : null}

      <View>
        {value.entries.map((entry) => (
          <View
            key={entry.clubId}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderBottomWidth: theme.border.hairline,
              borderBottomColor: theme.colors.line,
            }}
          >
            <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.ink, flex: 1 }]}>
              {entry.label}
            </Text>
            <View style={{ width: 96 }}>
              <TextInput
                accessibilityLabel={`Distancia ${entry.label}`}
                placeholder="—"
                placeholderTextColor={theme.colors.muted}
                keyboardType="decimal-pad"
                value={entry.distance}
                onChangeText={(text) => onChange(setEntryDistance(value, entry.clubId, text))}
                style={[
                  theme.textVariants.body,
                  {
                    color: theme.colors.ink,
                    textAlign: 'right',
                    borderWidth: theme.border.hairline,
                    borderColor: entryErrors[entry.clubId]
                      ? theme.colors.danger
                      : theme.colors.line,
                    borderRadius: theme.radius.sm,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: theme.spacing.xs,
                  },
                ]}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Quitar ${entry.label}`}
              onPress={() => onChange(removeEntry(value, entry.clubId))}
            >
              <Feather name="x" size={20} color={theme.colors.danger} />
            </Pressable>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setSheetOpen(true)}
        style={{
          borderWidth: theme.border.hairline,
          borderColor: theme.colors.accent,
          borderRadius: theme.radius.sm,
          borderCurve: 'continuous',
          paddingVertical: theme.spacing.md,
          alignItems: 'center',
        }}
      >
        <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
          + Añadir palo
        </Text>
      </Pressable>

      <ClubPickerSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        addedClubIds={value.entries.map((e) => e.clubId)}
        onAddClub={(club) => onChange(addClubFromCatalog(value, club))}
        onAddCustom={(label) => onChange(addCustomClub(value, label))}
      />
    </View>
  );
}
