import { colors } from './colors';
import { fontFamily, textVariants } from './typography';
import { spacing, radius, border } from './spacing';
import { icons } from './icons';

/** Objeto de tema agregado: única fuente de verdad del aspecto de la app. */
export const theme = {
  colors,
  textVariants,
  fontFamily,
  spacing,
  radius,
  border,
  icons,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './icons';
export * from './color-utils';
export * from './use-app-fonts';
