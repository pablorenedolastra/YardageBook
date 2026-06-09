import { View } from 'react-native';
import { theme } from '../theme';

export interface TargetMarkerProps {
  /** Color del borde del anillo. Por defecto el acento oliva. */
  color?: string;
}

/**
 * Objetivo movible: anillo de borde coloreado con **centro transparente** (se ve el
 * mapa por dentro). El jugador lo arrastra o toca el mapa para recolocarlo.
 */
export function TargetMarker({ color = theme.colors.accent }: TargetMarkerProps) {
  return (
    <View
      testID="target-marker"
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'transparent',
        borderWidth: 3,
        borderColor: color,
      }}
    />
  );
}
