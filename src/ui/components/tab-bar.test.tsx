import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabBar, type TabBarProps } from './tab-bar';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

// Estado mínimo simulando las props que expo-router Tabs pasa a tabBar.
// Doble de test mínimo: solo state + navigation, que es lo que TabBar consume.
// Se castea al tipo completo que expo-router pasa en runtime.
function makeProps(activeIndex: number): TabBarProps {
  return {
    state: {
      index: activeIndex,
      routes: [
        { key: 'index', name: 'index' },
        { key: 'yardage-book', name: 'yardage-book' },
        { key: 'profile', name: 'profile' },
      ],
    },
    navigation: {
      navigate: () => {},
      emit: () => ({ defaultPrevented: false }),
    },
  } as unknown as TabBarProps;
}

function renderTabBar(activeIndex: number) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <TabBar {...makeProps(activeIndex)} />
    </SafeAreaProvider>,
  );
}

describe('TabBar', () => {
  it('muestra las tres etiquetas de pestaña', () => {
    const { getByText } = renderTabBar(0);
    expect(getByText('Juego')).toBeTruthy();
    expect(getByText('Yardage Book')).toBeTruthy();
    expect(getByText('Perfil')).toBeTruthy();
  });
});
