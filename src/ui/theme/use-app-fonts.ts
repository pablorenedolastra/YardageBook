import { useFonts } from 'expo-font';
import { SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/**
 * Carga las fuentes de la app. Las claves son los nombres con los que React
 * Native resuelve cada fuente y DEBEN coincidir con fontFamily en typography.ts.
 * Devuelve [loaded, error] igual que useFonts.
 */
export function useAppFonts(): [boolean, Error | null] {
  return useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
}
