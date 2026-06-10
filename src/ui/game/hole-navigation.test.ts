import { clampHoleIndex, prevHole, nextHole } from './hole-navigation';

describe('clampHoleIndex', () => {
  it('deja un índice dentro de rango', () => {
    expect(clampHoleIndex(5, 18)).toBe(5);
  });
  it('no baja de 1', () => {
    expect(clampHoleIndex(0, 18)).toBe(1);
    expect(clampHoleIndex(-3, 18)).toBe(1);
  });
  it('no pasa del total', () => {
    expect(clampHoleIndex(20, 18)).toBe(18);
  });
  it('devuelve 1 si no hay hoyos', () => {
    expect(clampHoleIndex(1, 0)).toBe(1);
  });
});

describe('prevHole / nextHole', () => {
  it('avanza y retrocede dentro de rango', () => {
    expect(nextHole(1, 18)).toBe(2);
    expect(prevHole(5, 18)).toBe(4);
  });
  it('se queda en los extremos', () => {
    expect(prevHole(1, 18)).toBe(1);
    expect(nextHole(18, 18)).toBe(18);
  });
});
