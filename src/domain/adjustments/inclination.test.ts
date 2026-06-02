import { adjustForInclination } from './inclination';

describe('adjustForInclination', () => {
  it('no cambia la distancia en terreno llano', () => {
    expect(adjustForInclination(150, 0)).toBe(150);
  });

  it('suma metros cuesta arriba (desnivel positivo)', () => {
    expect(adjustForInclination(150, 5)).toBe(155);
  });

  it('resta metros cuesta abajo (desnivel negativo)', () => {
    expect(adjustForInclination(150, -8)).toBe(142);
  });
});
