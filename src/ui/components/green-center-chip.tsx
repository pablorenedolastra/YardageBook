import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface GreenCenterChipProps {
  /** Distancia al centro del green, ya en la unidad del perfil. */
  distance: number;
  /** Sufijo de unidad ('m' | 'yd'). */
  unit: string;
}

/** Lectura secundaria: distancia al centro del green (arriba der.). */
export function GreenCenterChip({ distance, unit }: GreenCenterChipProps) {
  return (
    <View
      style={{
        alignItems: 'flex-end',
        backgroundColor: theme.colors.paper,
        borderWidth: theme.border.hairline,
        borderColor: theme.colors.line,
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text style={[theme.textVariants.labelAccent, { color: theme.colors.muted }]}>
        AL CENTRO DEL GREEN
      </Text>
      <Text
        style={[
          theme.textVariants.bodyStrong,
          { color: theme.colors.ink, fontVariant: ['tabular-nums'] },
        ]}
      >
        {Math.round(distance)} {unit}
      </Text>
    </View>
  );
}
