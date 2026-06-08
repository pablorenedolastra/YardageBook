import { Pressable, Text } from 'react-native';
import { theme } from '../theme';

export interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Acción secundaria: transparente, borde 1.5px `accent`, texto `accent`. */
export function SecondaryButton({ title, onPress, disabled = false }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={{
        borderWidth: theme.border.hairline,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.accent }]}>{title}</Text>
    </Pressable>
  );
}
