import { fireEvent, render } from '@testing-library/react-native';
import { BagEditor } from './bag-editor';
import { addClubFromCatalog, emptyBag, type BagDraft } from '../forms/bag-form';
import { CLUB_CATALOG } from '../forms/clubs';

const i7 = CLUB_CATALOG.find((c) => c.clubId === '7i')!;

function bagWith7i(): BagDraft {
  return addClubFromCatalog(emptyBag(6, 'Madrid'), i7);
}

describe('BagEditor', () => {
  it('muestra los palos de la bolsa', () => {
    const { getByText } = render(<BagEditor value={bagWith7i()} onChange={() => {}} />);
    expect(getByText('Hierro 7')).toBeTruthy();
  });

  it('propaga el cambio de distancia', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<BagEditor value={bagWith7i()} onChange={onChange} />);
    fireEvent.changeText(getByLabelText('Distancia Hierro 7'), '150');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].entries[0].distance).toBe('150');
  });

  it('quita un palo', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<BagEditor value={bagWith7i()} onChange={onChange} />);
    fireEvent.press(getByLabelText('Quitar Hierro 7'));
    expect(onChange.mock.calls[0][0].entries).toHaveLength(0);
  });

  it('abre la hoja para añadir palos', () => {
    const { getByText } = render(<BagEditor value={emptyBag(6, 'Madrid')} onChange={() => {}} />);
    fireEvent.press(getByText('+ Añadir palo'));
    expect(getByText('Añadir palo')).toBeTruthy();
  });
});
