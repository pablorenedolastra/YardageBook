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

// react-native-maps es un módulo nativo (no va en jest). Lo mockeamos como Views
// para poder hacer smoke tests de los componentes que lo usan (HoleMap).
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Passthrough = ({ children, ...props }) => React.createElement(View, props, children);
  return {
    __esModule: true,
    default: Passthrough, // MapView
    Marker: Passthrough,
    Polygon: Passthrough,
    Polyline: Passthrough,
  };
});

// expo-location: permiso concedido + posición fija, para tests deterministas.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 36.28, longitude: -5.33 } }),
  ),
  Accuracy: { Balanced: 3, High: 4 },
}));
