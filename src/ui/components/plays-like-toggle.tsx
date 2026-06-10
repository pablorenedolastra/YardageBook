import { Pressable, Text } from 'react-native';
import { theme } from '../theme';

export interface PlaysLikeToggleProps {
  value: boolean;
  onToggle: (next: boolean) => void;
}

/** Toggle "Plays Like": gobierna si se aplican desnivel y meteo a la recomendación. */
export function PlaysLikeToggle({ value, onToggle }: PlaysLikeToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onToggle(!value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        backgroundColor: value ? theme.colors.accent : theme.colors.paper,
        borderWidth: theme.border.hairline,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.pill,
        borderCurve: 'continuous',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text
        style={[
          theme.textVariants.labelAccent,
          { color: value ? theme.colors.accentOn : theme.colors.accent },
        ]}
      >
        PLAYS LIKE {value ? 'ON' : 'OFF'}
      </Text>
    </Pressable>
  );
}
