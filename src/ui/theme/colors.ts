/** Paleta del sistema de diseño YardageBook. Única fuente de verdad de color. */
export const colors = {
  paper: '#EFE7D6', // fondo de app y tarjetas
  line: '#CDBFA4', // líneas finas, bordes neutros, separadores
  ink: '#5A4632', // texto principal
  muted: '#8A765C', // texto secundario, etiquetas, unidades
  accent: '#6E7A3A', // acción, bordes destacados, recomendación
  accentOn: '#F4EFDC', // texto/icono sobre acento
  accentDark: '#5A6530', // estado "pressed" del acento
  success: '#6E7A3A', // = acento
  warning: '#B5803A', // ámbar terroso
  danger: '#A8492F', // teja apagado
} as const;

export type ColorToken = keyof typeof colors;
