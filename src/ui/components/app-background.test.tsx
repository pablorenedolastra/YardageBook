import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppBackground } from './app-background';
import { theme } from '../theme';

describe('AppBackground', () => {
  it('renderiza los hijos', () => {
    render(
      <AppBackground>
        <Text>Hola campo</Text>
      </AppBackground>,
    );
    expect(screen.getByText('Hola campo')).toBeTruthy();
  });

  it('pinta el fondo con el color papel del tema', () => {
    render(
      <AppBackground>
        <Text>x</Text>
      </AppBackground>,
    );
    const root = screen.getByTestId('app-background');
    const flat = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style)
      : root.props.style;
    expect(flat.backgroundColor).toBe(theme.colors.paper);
  });

  it('renderiza la capa de textura de papel por encima del fondo', () => {
    render(
      <AppBackground>
        <Text>x</Text>
      </AppBackground>,
    );
    const texture = screen.getByTestId('paper-texture');
    const flat = Array.isArray(texture.props.style)
      ? Object.assign({}, ...texture.props.style)
      : texture.props.style;
    expect(flat.opacity).toBeCloseTo(0.09, 2);
  });
});
