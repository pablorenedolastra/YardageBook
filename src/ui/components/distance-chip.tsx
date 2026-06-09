import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface DistanceChipProps {
  /** Distancia ya convertida a la unidad del perfil. */
  distance: number;
  /** Sufijo de unidad ('m' | 'yd'). */
  unit: string;
  /** Color del chip: 'ink' (tiro GPS→objetivo) o 'accent' (objetivo→green). */
  tone?: 'ink' | 'accent';
}

/** Chip con la distancia de una línea de medición, para superponer en el mapa. */
export function DistanceChip({ distance, unit, tone = 'ink' }: DistanceChipProps) {
  return (
    <View
      style={{
        backgroundColor: tone === 'accent' ? theme.colors.accent : theme.colors.ink,
        borderRadius: theme.radius.pill,
        borderCurve: 'continuous',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
      }}
    >
      <Text
        style={[
          theme.textVariants.bodyStrong,
          { color: theme.colors.accentOn, fontVariant: ['tabular-nums'] },
        ]}
      >
        {Math.round(distance)} {unit}
      </Text>
    </View>
  );
}
