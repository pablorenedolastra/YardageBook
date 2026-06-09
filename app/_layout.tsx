import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme, useAppFonts } from '../src/ui/theme';

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    // Pantalla color papel mientras cargan las fuentes.
    return <View style={{ flex: 1, backgroundColor: theme.colors.paper }} />;
  }

  // El fondo de papel lo pinta cada pantalla (AppBackground): así cada escena es
  // opaca y, en las pestañas, la activa tapa a las inactivas (que en web se
  // renderizan detrás en vez de ocultarse).
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.paper },
        }}
      />
    </SafeAreaProvider>
  );
}
