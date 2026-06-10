import { render } from '@testing-library/react-native';
import { GreenCenterChip } from './green-center-chip';

describe('GreenCenterChip', () => {
  it('muestra la distancia al centro del green', () => {
    const { getByText } = render(<GreenCenterChip distance={182.3} unit="m" />);
    expect(getByText('AL CENTRO DEL GREEN')).toBeTruthy();
    expect(getByText('182 m')).toBeTruthy();
  });
});
