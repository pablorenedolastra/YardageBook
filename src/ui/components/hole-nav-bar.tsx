import { Pressable, Text, View } from 'react-native';
import { theme } from '../theme';

export interface HoleNavBarProps {
  /** Número de hoyo (1-based). */
  holeRef: number;
  par?: number;
  strokeIndex?: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/** Barra inferior de navegación: ‹  Hoyo {n} · PAR {x} · S.I. {y}  › */
export function HoleNavBar({
  holeRef,
  par,
  strokeIndex,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: HoleNavBarProps) {
  const parts = [`Hoyo ${holeRef}`];
  if (par != null) parts.push(`PAR ${par}`);
  if (strokeIndex != null) parts.push(`S.I. ${strokeIndex}`);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.paper,
        borderWidth: theme.border.hairline,
        borderColor: theme.colors.line,
        borderRadius: theme.radius.sm,
        borderCurve: 'continuous',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hoyo anterior"
        accessibilityState={{ disabled: !canPrev }}
        disabled={!canPrev}
        onPress={onPrev}
      >
        <Text
          style={[
            theme.textVariants.titleApp,
            { color: canPrev ? theme.colors.accent : theme.colors.line },
          ]}
        >
          ‹
        </Text>
      </Pressable>

      <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.ink }]}>
        {parts.join(' · ')}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hoyo siguiente"
        accessibilityState={{ disabled: !canNext }}
        disabled={!canNext}
        onPress={onNext}
      >
        <Text
          style={[
            theme.textVariants.titleApp,
            { color: canNext ? theme.colors.accent : theme.colors.line },
          ]}
        >
          ›
        </Text>
      </Pressable>
    </View>
  );
}
