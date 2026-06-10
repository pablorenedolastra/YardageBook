import { render } from '@testing-library/react-native';
import { GpsMarker } from './gps-marker';
import { TargetMarker } from './target-marker';
import { DistanceChip } from './distance-chip';

describe('marcadores y chip de distancia', () => {
  it('GpsMarker muestra la inicial en mayúscula', () => {
    const { getByText } = render(<GpsMarker initial="pablo" />);
    expect(getByText('P')).toBeTruthy();
  });

  it('TargetMarker renderiza', () => {
    const { getByTestId } = render(<TargetMarker />);
    expect(getByTestId('target-marker')).toBeTruthy();
  });

  it('DistanceChip redondea la distancia', () => {
    const { getByText } = render(<DistanceChip distance={128.7} unit="m" />);
    expect(getByText('129 m')).toBeTruthy();
  });
});
