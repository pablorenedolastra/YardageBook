import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';

type AppBackgroundProps = {
  children: ReactNode;
};

/** Lienzo de la app: pinta el papel crema bajo todo el contenido. */
export function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View testID="app-background" style={styles.root}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
});
