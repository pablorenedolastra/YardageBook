import { spacing, radius, border } from './spacing';

describe('spacing scale', () => {
  it('toda la escala de espaciado es múltiplo de 4 (base-4)', () => {
    for (const value of Object.values(spacing)) {
      expect(value % 4).toBe(0);
    }
  });

  it('expone los radios del spec', () => {
    expect(radius).toEqual({ pill: 6, sm: 9, md: 12, lg: 18 });
  });

  it('el borde fino es de 1.5px', () => {
    expect(border.hairline).toBe(1.5);
  });
});
