import { fontFamily, textVariants } from './typography';

describe('typography', () => {
  it('las familias apuntan a las fuentes que cargará useAppFonts', () => {
    expect(fontFamily.display).toBe('SpaceGrotesk_700Bold');
    expect(fontFamily.body).toBe('Inter_400Regular');
  });

  it('define todas las variantes de texto del spec', () => {
    expect(Object.keys(textVariants).sort()).toEqual(
      [
        'display',
        'clubName',
        'titleApp',
        'sectionHead',
        'body',
        'bodyStrong',
        'small',
        'caption',
        'labelAccent',
      ].sort(),
    );
  });

  it('display y clubName usan cifras de ancho fijo (tabular-nums)', () => {
    expect(textVariants.display.fontVariant).toContain('tabular-nums');
    expect(textVariants.clubName.fontVariant).toContain('tabular-nums');
  });

  it('caption y labelAccent van en mayúsculas', () => {
    expect(textVariants.caption.textTransform).toBe('uppercase');
    expect(textVariants.labelAccent.textTransform).toBe('uppercase');
  });
});
