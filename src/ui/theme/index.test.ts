import { theme } from './index';

describe('theme', () => {
  it('agrega todos los grupos de tokens', () => {
    expect(Object.keys(theme).sort()).toEqual(
      ['colors', 'textVariants', 'fontFamily', 'spacing', 'radius', 'border', 'icons'].sort(),
    );
  });

  it('reexporta los tokens individuales (acceso directo)', () => {
    expect(theme.colors.accent).toBe('#6E7A3A');
    expect(theme.radius.md).toBe(12);
  });
});
