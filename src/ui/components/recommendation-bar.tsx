import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface RecommendationBarProps {
  /** Etiqueta del palo recomendado (p. ej. "Hierro 7"). */
  clubLabel: string;
  /** Distancia objetivo, ya en la unidad del perfil. */
  distance: number;
  /** Sufijo de unidad ('m' | 'yd'). */
  unit: string;
}

/** Barra fina de palo recomendado: "TU PALO · {palo} · {n} {unidad}". Borde oliva. */
export function RecommendationBar({ clubLabel, distance, unit }: RecommendationBarProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.paper,
        borderWidth: theme.border.hairline,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <Text style={[theme.textVariants.labelAccent, { color: theme.colors.accent }]}>TU PALO</Text>
      <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.ink, flex: 1 }]}>
        {clubLabel}
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
