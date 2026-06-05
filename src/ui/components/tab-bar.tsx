import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';

/**
 * Props que expo-router `Tabs` pasa a su render prop `tabBar`. Se derivan del
 * propio componente `Tabs` para no acoplarse a rutas internas de react-navigation.
 */
export type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

/** Configuración visible de cada pestaña, en orden. */
const TABS: { name: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { name: 'index', label: 'Juego', icon: theme.icons.game },
  { name: 'yardage-book', label: 'Yardage Book', icon: theme.icons.yardageBook },
  { name: 'profile', label: 'Perfil', icon: theme.icons.profile },
];

/**
 * Barra de pestañas a medida (sistema de diseño): borde superior `line`,
 * iconos Feather de contorno, pestaña activa en `accent`.
 */
export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderTopWidth: theme.border.hairline,
        borderTopColor: theme.colors.line,
        backgroundColor: theme.colors.paper,
        paddingBottom: insets.bottom,
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = state.index === index;
        const color = isActive ? theme.colors.accent : theme.colors.ink;
        const route = state.routes[index];
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: theme.spacing.sm,
              gap: 2,
            }}
          >
            <Feather name={tab.icon} size={20} color={color} />
            <Text style={[theme.textVariants.caption, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
