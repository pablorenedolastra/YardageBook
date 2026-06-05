/** Escala de espaciado base-4 (en px). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Radios de esquina. */
export const radius = {
  pill: 6,
  sm: 9,
  md: 12,
  lg: 18,
} as const;

/** Grosores de borde. */
export const border = {
  hairline: 1.5,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
