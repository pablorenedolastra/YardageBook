// src/ui/components/app-background.tsx
import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { theme } from '../theme';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const paperTexture = require('../../../assets/paper-texture.png');

type AppBackgroundProps = {
  children: ReactNode;
};

/** Lienzo de la app: papel crema con grano reciclado sutil bajo el contenido. */
export function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View testID="app-background" style={styles.root}>
      <Image
        testID="paper-texture"
        source={paperTexture}
        resizeMode="repeat"
        style={styles.texture}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  texture: {
    ...StyleSheet.absoluteFill,
    opacity: 0.09,
    pointerEvents: 'none', // capa decorativa: nunca intercepta toques
  },
});
