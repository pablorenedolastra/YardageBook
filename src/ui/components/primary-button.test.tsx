import { fireEvent, render } from '@testing-library/react-native';
import { PrimaryButton } from './primary-button';

describe('PrimaryButton', () => {
  it('llama a onPress al pulsar', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton title="Continuar" onPress={onPress} />);
    fireEvent.press(getByText('Continuar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no llama a onPress cuando está deshabilitado', () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton title="Continuar" onPress={onPress} disabled />);
    fireEvent.press(getByText('Continuar'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
