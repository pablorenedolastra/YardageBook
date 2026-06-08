import { TextInput, type TextInputProps, Text, View } from 'react-native';
import { theme } from '../theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Etiqueta visible sobre el campo. */
  label: string;
  /** Mensaje de error (si hay), pinta el borde en `danger`. */
  error?: string;
}

/** Campo de texto del sistema de diseño: borde `line` 1.5px, `radiusSm`. */
export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.muted}
        style={[
          theme.textVariants.body,
          {
            color: theme.colors.ink,
            borderWidth: theme.border.hairline,
            borderColor: error ? theme.colors.danger : theme.colors.line,
            borderRadius: theme.radius.sm,
            borderCurve: 'continuous',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          },
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[theme.textVariants.small, { color: theme.colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
}
