import { colors } from './colors';

describe('colors', () => {
  it('expone todos los tokens del sistema de diseño', () => {
    expect(Object.keys(colors).sort()).toEqual(
      [
        'accent',
        'accentDark',
        'accentOn',
        'danger',
        'ink',
        'line',
        'markerTarget',
        'muted',
        'paper',
        'success',
        'warning',
      ].sort(),
    );
  });

  it('todos los valores son hex de 6 dígitos', () => {
    for (const value of Object.values(colors)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it('success reutiliza el acento oliva (decisión del spec)', () => {
    expect(colors.success).toBe(colors.accent);
  });
});
