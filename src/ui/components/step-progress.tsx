import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface StepProgressProps {
  /** Paso actual (1-based). */
  step: number;
  /** Número total de pasos. */
  total: number;
}

/** Indicador de progreso del onboarding: barras + "Paso n de N". */
export function StepProgress({ step, total }: StepProgressProps) {
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: theme.radius.pill,
              backgroundColor: i < step ? theme.colors.accent : theme.colors.line,
            }}
          />
        ))}
      </View>
      <Text style={[theme.textVariants.caption, { color: theme.colors.muted }]}>
        Paso {step} de {total}
      </Text>
    </View>
  );
}
