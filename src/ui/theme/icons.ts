/**
 * Nombres de iconos Feather (@expo/vector-icons) usados en la app.
 * Estilo de contorno, coherente con el lenguaje "plano con líneas".
 */
export const icons = {
  shot: 'target',
  clubs: 'grid',
  game: 'flag',
  yardageBook: 'book-open',
  profile: 'user',
  settings: 'settings',
  location: 'map-pin',
  increase: 'plus',
  decrease: 'minus',
} as const;

export type IconKey = keyof typeof icons;
