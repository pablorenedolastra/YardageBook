import { View } from 'react-native';
import { theme } from '../theme';

/** Objetivo que el jugador coloca tocando el mapa: círculo blanco con anillo oliva. */
export function TargetMarker() {
  return (
    <View
      testID="target-marker"
      style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.markerTarget,
        borderWidth: 3,
        borderColor: theme.colors.accent,
      }}
    />
  );
}
