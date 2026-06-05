import { Text, View } from 'react-native';
import { theme } from '../theme';

/** Placeholder de pantalla mientras se construye el contenido real. */
export function ScreenPlaceholder({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        gap: theme.spacing.sm,
      }}
    >
      <Text style={[theme.textVariants.titleApp, { color: theme.colors.ink }]}>{title}</Text>
      {subtitle ? (
        <Text style={[theme.textVariants.small, { color: theme.colors.muted, textAlign: 'center' }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
