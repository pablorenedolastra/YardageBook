import { fireEvent, render } from '@testing-library/react-native';
import { ClubPickerSheet } from './club-picker-sheet';

describe('ClubPickerSheet', () => {
  it('añade un palo del catálogo por su botón', () => {
    const onAddClub = jest.fn();
    const { getByLabelText } = render(
      <ClubPickerSheet
        visible
        onClose={() => {}}
        addedClubIds={[]}
        onAddClub={onAddClub}
        onAddCustom={() => {}}
      />,
    );
    fireEvent.press(getByLabelText('Añadir Driver'));
    expect(onAddClub).toHaveBeenCalledWith(expect.objectContaining({ clubId: 'driver' }));
  });

  it('marca como añadido un palo ya en la bolsa', () => {
    const { getByText } = render(
      <ClubPickerSheet
        visible
        onClose={() => {}}
        addedClubIds={['driver']}
        onAddClub={() => {}}
        onAddCustom={() => {}}
      />,
    );
    expect(getByText('Añadido ✓')).toBeTruthy();
  });
});
