import { Tabs } from 'expo-router';
import { TabBar } from '../../src/ui/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Juego' }} />
      <Tabs.Screen name="yardage-book" options={{ title: 'Yardage Book' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
