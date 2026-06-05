import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { createAppRepository } from '../src/services/storage';
import { theme } from '../src/ui/theme';

type GateState = 'loading' | 'tabs' | 'onboarding';

/** Puerta de entrada: decide onboarding (sin perfil) o pestañas (con perfil). */
export default function Index() {
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    createAppRepository()
      .loadProfile()
      .then((profile) => setState(profile ? 'tabs' : 'onboarding'))
      .catch(() => setState('onboarding'));
  }, []);

  if (state === 'loading') {
    return <View style={{ flex: 1, backgroundColor: theme.colors.paper }} />;
  }

  return <Redirect href={state === 'tabs' ? '/(tabs)' : '/onboarding'} />;
}
