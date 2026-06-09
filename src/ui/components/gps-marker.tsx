import { Text, View } from 'react-native';
import { theme } from '../theme';

export interface GpsMarkerProps {
  /** Inicial del jugador (1 letra). */
  initial: string;
}

/** Marcador de posición GPS: círculo papel con borde/halo oliva e inicial. */
export function GpsMarker({ initial }: GpsMarkerProps) {
  return (
    <View
      testID="gps-marker"
      style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: theme.colors.paper,
        borderWidth: 3,
        borderColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.accent,
        shadowOpacity: 0.5,
        shadowRadius: 6,
      }}
    >
      <Text style={[theme.textVariants.bodyStrong, { color: theme.colors.ink }]}>
        {initial.slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}
