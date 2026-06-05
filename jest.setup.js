// Mock global de expo-font: el barrel src/ui/theme reexporta useAppFonts, que
// importa expo-font (módulo nativo) de forma transitiva. Cualquier test que
// importe el tema lo arrastra, así que lo mockeamos una sola vez aquí.
// Los tests que necesiten inspeccionar la llamada (p. ej. use-app-fonts.test.ts)
// pueden declarar su propio jest.mock local, que tiene precedencia.
// `@expo/vector-icons` (Feather) llama a Font.isLoaded/loadAsync al construir el
// icon set, así que el mock debe cubrir también esa superficie, no solo useFonts.
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
  loadAsync: jest.fn(() => Promise.resolve()),
  processFontFamily: jest.fn((family) => family),
}));
