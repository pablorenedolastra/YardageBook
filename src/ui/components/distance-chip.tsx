import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface DistanceChipProps {
  /** Distancia ya convertida a la unidad del perfil. */
  distance: number;
  /** Sufijo de unidad ('m' | 'yd'). */
  unit: string;
  /** Color del chip: 'ink' (tiro GPS→objetivo) o 'accent' (objetivo→green). */
  tone?: 'ink' | 'accent';
  /** Palo recomendado que cubre esa distancia (de la bolsa). Opcional. */
  club?: string | null;
}

/** Chip con la distancia de una línea de medición (+ palo recomendado), sobre el mapa. */
export function DistanceChip({ distance, unit, tone = 'ink', club }: DistanceChipProps) {
  return (
    <View
      style={{
        alignItems: 'center',
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
      {club ? (
        <Text style={[theme.textVariants.labelAccent, { color: theme.colors.accentOn }]}>
          {club}
        </Text>
      ) : null}
    </View>
  );
}
