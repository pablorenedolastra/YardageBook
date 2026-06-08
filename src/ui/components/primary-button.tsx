import { Pressable, Text } from 'react-native';
import { theme } from '../theme';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Acción primaria: relleno `accent`, texto `accentOn` (Space Grotesk 700). */
export function PrimaryButton({ title, onPress, disabled = false }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.accentDark : theme.colors.accent,
        opacity: disabled ? 0.4 : 1,
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
      })}
    >
      <Text style={[theme.textVariants.titleApp, { color: theme.colors.accentOn }]}>{title}</Text>
    </Pressable>
  );
}
