import { withOpacity } from './color-utils';

describe('withOpacity', () => {
  it('añade el canal alfa en formato #RRGGBBAA', () => {
    expect(withOpacity('#6E7A3A', 1)).toBe('#6E7A3AFF');
    expect(withOpacity('#6E7A3A', 0)).toBe('#6E7A3A00');
  });

  it('redondea el alfa (0.09 -> 17 -> "17")', () => {
    expect(withOpacity('#000000', 0.09)).toBe('#00000017');
  });

  it('acepta hex en minúsculas y lo normaliza a mayúsculas', () => {
    expect(withOpacity('#abcdef', 0.5)).toBe('#ABCDEF80');
  });

  it('lanza si el alfa está fuera de [0, 1]', () => {
    expect(() => withOpacity('#000000', 1.5)).toThrow();
    expect(() => withOpacity('#000000', -0.1)).toThrow();
  });
});
