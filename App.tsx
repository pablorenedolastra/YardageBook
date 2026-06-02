// App.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AppBackground } from './src/ui/components/app-background';
import { theme, useAppFonts } from './src/ui/theme';

export default function App() {
  const [fontsLoaded] = useAppFonts();

  if (!fontsLoaded) {
    // Pantalla en blanco con color papel mientras cargan las fuentes.
    return <View style={styles.loading} />;
  }

  return (
    <AppBackground>
      <View style={styles.screen}>
        <StatusBar style="dark" />
        <Text style={[theme.textVariants.caption, styles.muted]}>Objetivo</Text>
        <Text style={[theme.textVariants.display, styles.ink]}>143 m</Text>

        <View style={styles.reco}>
          <Text style={[theme.textVariants.labelAccent, styles.accent]}>Tu palo</Text>
          <Text style={[theme.textVariants.clubName, styles.ink]}>Hierro 7</Text>
        </View>

        <Text style={[theme.textVariants.small, styles.muted]}>
          Carry ajustado hoy: 145 m
        </Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  screen: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl * 2,
    gap: theme.spacing.sm,
  },
  ink: { color: theme.colors.ink },
  muted: { color: theme.colors.muted },
  accent: { color: theme.colors.accent },
  reco: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
});
