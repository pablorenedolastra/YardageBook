import { Text, View } from 'react-native';
import { Hole, LatLng } from '../../domain';
import { theme } from '../theme';

export interface HoleMapProps {
  hole: Hole;
  gps: LatLng | null;
  target: LatLng | null;
  playerInitial: string;
  aimDistance: number | null;
  unit: string;
  onPressMap: (p: LatLng) => void;
}

/**
 * Fallback web: react-native-maps no renderiza en react-native-web. Mantiene el
 * mismo contrato de props para que la pantalla compile y `expo export --platform
 * web` siga pasando. El mapa real se prueba en Expo Go (iOS).
 */
export function HoleMap(_props: HoleMapProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.line,
      }}
    >
      <Text
        style={[theme.textVariants.body, { color: theme.colors.ink, textAlign: 'center' }]}
      >
        El mapa del hoyo solo está disponible en la app (iOS/Android). Ábrela en Expo
        Go para ver el satélite, tu GPS y la recomendación de palo.
      </Text>
    </View>
  );
}
