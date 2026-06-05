import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppBackground } from '../src/ui/components/app-background';
import { theme, useAppFonts } from '../src/ui/theme';

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    // Pantalla color papel mientras cargan las fuentes.
    return <View style={{ flex: 1, backgroundColor: theme.colors.paper }} />;
  }

  return (
    <SafeAreaProvider>
      <AppBackground>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </AppBackground>
    </SafeAreaProvider>
  );
}
