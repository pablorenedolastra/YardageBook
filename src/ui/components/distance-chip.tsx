import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface DistanceChipProps {
  /** Distancia ya convertida a la unidad del perfil. */
  distance: number;
  /** Sufijo de unidad ('m' | 'yd'). */
  unit: string;
}

/** Chip oscuro con la distancia al objetivo, para superponer sobre la línea de tiro. */
export function DistanceChip({ distance, unit }: DistanceChipProps) {
  return (
    <View
      style={{
        backgroundColor: theme.colors.ink,
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
