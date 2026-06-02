const mockUseFonts = jest.fn((_map: Record<string, unknown>): [boolean, null] => [true, null]);
jest.mock('expo-font', () => ({ useFonts: (map: Record<string, unknown>) => mockUseFonts(map) }));

import { useAppFonts } from './use-app-fonts';

describe('useAppFonts', () => {
  it('carga las seis fuentes que referencian los tokens tipográficos', () => {
    const [loaded] = useAppFonts();
    expect(loaded).toBe(true);

    const passedMap = mockUseFonts.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(passedMap).sort()).toEqual(
      [
        'SpaceGrotesk_500Medium',
        'SpaceGrotesk_700Bold',
        'Inter_400Regular',
        'Inter_500Medium',
        'Inter_600SemiBold',
        'Inter_700Bold',
      ].sort(),
    );
  });
});
