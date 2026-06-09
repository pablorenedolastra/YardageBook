import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CatalogClub, clubsByGroup } from '../forms/clubs';
import { theme } from '../theme';

export interface ClubPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  /** clubIds ya añadidos a la bolsa. */
  addedClubIds: string[];
  onAddClub: (club: CatalogClub) => void;
  onAddCustom: (label: string) => void;
}

/** Hoja inferior con el catálogo de palos agrupado + alta de personalizados. */
export function ClubPickerSheet({
  visible,
  onClose,
  addedClubIds,
  onAddClub,
  onAddCustom,
}: ClubPickerSheetProps) {
  const [customLabel, setCustomLabel] = useState('');
  const added = new Set(addedClubIds);

  const addCustom = () => {
    if (!customLabel.trim()) return;
    onAddCustom(customLabel.trim());
    setCustomLabel('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.colors.paper }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: theme.spacing.xl,
          }}
        >
          <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>
            Añadir palo
          </Text>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
              Cerrar
            </Text>
          </Pressable>
        </View>

        <ScrollView
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: theme.spacing.xxxl }}
        >
          {clubsByGroup().map(({ group, clubs }) => (
            <View key={group} style={{ marginBottom: theme.spacing.md }}>
              <Text
                style={[
                  theme.textVariants.sectionHead,
                  {
                    color: theme.colors.muted,
                    paddingHorizontal: theme.spacing.xl,
                    paddingVertical: theme.spacing.sm,
                  },
                ]}
              >
                {group}
              </Text>
              {clubs.map((club) => {
                const isAdded = added.has(club.clubId);
                return (
                  <View
                    key={club.clubId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: theme.spacing.xl,
                      paddingVertical: theme.spacing.md,
                      borderBottomWidth: theme.border.hairline,
                      borderBottomColor: theme.colors.line,
                    }}
                  >
                    <Text style={[theme.textVariants.body, { color: theme.colors.ink }]}>
                      {club.label}
                    </Text>
                    {isAdded ? (
                      <Text style={[theme.textVariants.small, { color: theme.colors.muted }]}>
                        Añadido ✓
                      </Text>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Añadir ${club.label}`}
                        onPress={() => onAddClub(club)}
                        hitSlop={theme.spacing.md}
                        style={({ pressed }) => ({
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          borderCurve: 'continuous',
                          marginRight: theme.spacing.xs,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: pressed ? theme.colors.accentDark : theme.colors.accent,
                        })}
                      >
                        <Feather name="plus" size={22} color={theme.colors.accentOn} />
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.sm }}>
            <Text style={[theme.textVariants.sectionHead, { color: theme.colors.muted }]}>
              Palo personalizado
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' }}>
              <TextInput
                placeholder="Ej. Driving iron"
                placeholderTextColor={theme.colors.muted}
                value={customLabel}
                onChangeText={setCustomLabel}
                style={[
                  theme.textVariants.body,
                  {
                    flex: 1,
                    color: theme.colors.ink,
                    borderWidth: theme.border.hairline,
                    borderColor: theme.colors.line,
                    borderRadius: theme.radius.sm,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                  },
                ]}
              />
              <Pressable accessibilityRole="button" onPress={addCustom}>
                <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
                  Añadir
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
