import { fireEvent, render } from '@testing-library/react-native';
import { SegmentedControl } from './segmented-control';

const options = [
  { label: 'Metros', value: 'meters' as const },
  { label: 'Yardas', value: 'yards' as const },
];

describe('SegmentedControl', () => {
  it('muestra las opciones y notifica el cambio', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <SegmentedControl options={options} value="meters" onChange={onChange} />,
    );
    expect(getByText('Metros')).toBeTruthy();
    fireEvent.press(getByText('Yardas'));
    expect(onChange).toHaveBeenCalledWith('yards');
  });
});
