import { fireEvent, render } from '@testing-library/react-native';
import { SearchAutocomplete } from './search-autocomplete';
import type { CourseSummary } from '../../services/courses';

const lasBrisas: CourseSummary = {
  id: 'osm-way-1',
  name: 'Las Brisas',
  location: { lat: 36.5, lng: -4.9 },
  holeCount: 18,
};

describe('SearchAutocomplete', () => {
  it('propaga el texto tecleado', () => {
    const onChangeQuery = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchAutocomplete
        query=""
        onChangeQuery={onChangeQuery}
        results={[]}
        onSelect={jest.fn()}
      />,
    );
    fireEvent.changeText(getByPlaceholderText('Buscar campo'), 'bris');
    expect(onChangeQuery).toHaveBeenCalledWith('bris');
  });

  it('renderiza los resultados y permite seleccionar', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <SearchAutocomplete
        query="bris"
        onChangeQuery={jest.fn()}
        results={[lasBrisas]}
        onSelect={onSelect}
      />,
    );
    fireEvent.press(getByText('Las Brisas'));
    expect(onSelect).toHaveBeenCalledWith(lasBrisas);
  });

  it('muestra estado vacío cuando hay query sin coincidencias', () => {
    const { getByText } = render(
      <SearchAutocomplete query="zzz" onChangeQuery={jest.fn()} results={[]} onSelect={jest.fn()} />,
    );
    expect(getByText('No hay campos que coincidan.')).toBeTruthy();
  });
});
