import { icons } from './icons';

describe('icons', () => {
  it('define el set mínimo de v1', () => {
    expect(Object.keys(icons).sort()).toEqual(
      ['shot', 'clubs', 'profile', 'settings', 'location', 'increase', 'decrease'].sort(),
    );
  });

  it('todos los nombres son strings no vacíos', () => {
    for (const name of Object.values(icons)) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});
