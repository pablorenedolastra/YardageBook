import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { MONTHS, monthName } from '../forms/months';
import { theme } from '../theme';

export interface MonthPickerProps {
  label: string;
  /** Mes seleccionado, 1-12. */
  value: number;
  onChange: (month: number) => void;
}

/** Selector de mes: dispara un modal con los 12 meses. */
export function MonthPicker({ label, value, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={{
          borderWidth: theme.border.hairline,
          borderColor: theme.colors.line,
          borderRadius: theme.radius.sm,
          borderCurve: 'continuous',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <Text style={[theme.textVariants.body, { color: theme.colors.ink }]}>
          {monthName(value)}
        </Text>
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.paper }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: theme.spacing.xl,
            }}
          >
            <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>Mes</Text>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
              <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
                Cerrar
              </Text>
            </Pressable>
          </View>
          <FlatList
            data={MONTHS}
            keyExtractor={(m) => m}
            renderItem={({ item, index }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(index + 1);
                  setOpen(false);
                }}
                style={{
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.xl,
                  borderBottomWidth: theme.border.hairline,
                  borderBottomColor: theme.colors.line,
                }}
              >
                <Text style={[theme.textVariants.body, { color: theme.colors.ink }]}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
