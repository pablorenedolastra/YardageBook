import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { COUNTRIES, countryName } from '../forms/countries';
import { theme } from '../theme';

export interface CountryPickerProps {
  label: string;
  /** Código de país seleccionado, o '' si ninguno. */
  value: string;
  onChange: (code: string) => void;
  error?: string;
}

/** Normaliza para búsqueda: minúsculas y sin acentos. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Selector de país: dispara un modal con buscador sobre la lista curada. */
export function CountryPicker({ label, value, onChange, error }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => normalize(c.name).includes(q));
  }, [query]);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={{
          borderWidth: theme.border.hairline,
          borderColor: error ? theme.colors.danger : theme.colors.line,
          borderRadius: theme.radius.sm,
          borderCurve: 'continuous',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        }}
      >
        <Text
          style={[
            theme.textVariants.body,
            { color: value ? theme.colors.ink : theme.colors.muted },
          ]}
        >
          {value ? countryName(value) : 'Selecciona tu país'}
        </Text>
      </Pressable>
      {error ? (
        <Text style={[theme.textVariants.small, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.paper }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: theme.spacing.xl,
              gap: theme.spacing.md,
            }}
          >
            <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>País</Text>
            <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
              <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>
                Cerrar
              </Text>
            </Pressable>
          </View>
          <TextInput
            placeholder="Buscar país"
            placeholderTextColor={theme.colors.muted}
            value={query}
            onChangeText={setQuery}
            style={[
              theme.textVariants.body,
              {
                color: theme.colors.ink,
                borderWidth: theme.border.hairline,
                borderColor: theme.colors.line,
                borderRadius: theme.radius.sm,
                marginHorizontal: theme.spacing.xl,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              },
            ]}
          />
          <FlatList
            data={results}
            keyExtractor={(c) => c.code}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(item.code);
                  setQuery('');
                  setOpen(false);
                }}
                style={{
                  paddingVertical: theme.spacing.md,
                  paddingHorizontal: theme.spacing.xl,
                  borderBottomWidth: theme.border.hairline,
                  borderBottomColor: theme.colors.line,
                }}
              >
                <Text style={[theme.textVariants.body, { color: theme.colors.ink }]}>
                  {item.name}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
