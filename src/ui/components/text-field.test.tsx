import { fireEvent, render } from '@testing-library/react-native';
import { TextField } from './text-field';

describe('TextField', () => {
  it('muestra la etiqueta y propaga los cambios de texto', () => {
    const onChangeText = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <TextField label="Nombre" placeholder="Tu nombre" onChangeText={onChangeText} />,
    );
    expect(getByText('Nombre')).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText('Tu nombre'), 'Pablo');
    expect(onChangeText).toHaveBeenCalledWith('Pablo');
  });

  it('muestra el mensaje de error cuando se pasa', () => {
    const { getByText } = render(<TextField label="Email" error="Email no válido" />);
    expect(getByText('Email no válido')).toBeTruthy();
  });
});
