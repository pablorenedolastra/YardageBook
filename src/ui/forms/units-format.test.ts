import { unitLabel, toUnitDistance } from './units-format';

describe('unitLabel', () => {
  it('da el sufijo correcto por unidad', () => {
    expect(unitLabel('meters')).toBe('m');
    expect(unitLabel('yards')).toBe('yd');
  });
});

describe('toUnitDistance', () => {
  it('deja los metros igual cuando la unidad es metros', () => {
    expect(toUnitDistance(150, 'meters')).toBe(150);
  });

  it('convierte metros a yardas', () => {
    // 1 yarda = 0.9144 m → 100 m ≈ 109.36 yd
    expect(toUnitDistance(100, 'yards')).toBeCloseTo(109.361, 2);
  });

  it('0 metros son 0 en cualquier unidad', () => {
    expect(toUnitDistance(0, 'yards')).toBe(0);
    expect(toUnitDistance(0, 'meters')).toBe(0);
  });
});
