import type { TextStyle } from 'react-native';

/**
 * Claves de familia. Cada string DEBE coincidir con una fuente registrada por
 * useAppFonts (ver use-app-fonts.ts), porque ese es el nombre con el que React
 * Native resuelve la fuente.
 */
export const fontFamily = {
  display: 'SpaceGrotesk_700Bold',
  heading: 'SpaceGrotesk_700Bold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

/** Escala tipográfica. `satisfies` mantiene la inferencia literal y valida tipos. */
export const textVariants = {
  display: { fontFamily: fontFamily.display, fontSize: 40, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  clubName: { fontFamily: fontFamily.display, fontSize: 30, letterSpacing: -0.3, fontVariant: ['tabular-nums'] },
  titleApp: { fontFamily: fontFamily.heading, fontSize: 18 },
  sectionHead: { fontFamily: fontFamily.heading, fontSize: 13 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.bodySemibold, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.bodySemibold, fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' },
  labelAccent: { fontFamily: fontFamily.bodyBold, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;
