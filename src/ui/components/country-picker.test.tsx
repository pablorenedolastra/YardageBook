import { fireEvent, render } from '@testing-library/react-native';
import { CountryPicker } from './country-picker';

describe('CountryPicker', () => {
  it('muestra el placeholder cuando no hay valor', () => {
    const { getByText } = render(
      <CountryPicker label="País" value="" onChange={() => {}} />,
    );
    expect(getByText('Selecciona tu país')).toBeTruthy();
  });

  it('muestra el nombre del país seleccionado', () => {
    const { getByText } = render(
      <CountryPicker label="País" value="ES" onChange={() => {}} />,
    );
    expect(getByText('España')).toBeTruthy();
  });

  it('abre el modal y selecciona un país por su código', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CountryPicker label="País" value="" onChange={onChange} />,
    );
    fireEvent.press(getByText('Selecciona tu país'));
    fireEvent.press(getByText('Portugal'));
    expect(onChange).toHaveBeenCalledWith('PT');
  });
});
