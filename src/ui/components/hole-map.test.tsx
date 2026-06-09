import { render } from '@testing-library/react-native';
import { HoleMap } from './hole-map';
import type { Hole } from '../../domain';

const hole: Hole = {
  ref: 1,
  par: 4,
  strokeIndex: 5,
  green: {
    center: { lat: 36.285, lng: -5.33 },
    polygon: [
      { lat: 36.2851, lng: -5.3301 },
      { lat: 36.2852, lng: -5.3299 },
      { lat: 36.285, lng: -5.3298 },
    ],
  },
  tees: [{ lat: 36.282, lng: -5.332 }],
  playLine: [
    { lat: 36.282, lng: -5.332 },
    { lat: 36.285, lng: -5.33 },
  ],
};

describe('HoleMap', () => {
  it('renderiza el marcador GPS y el objetivo con la distancia', () => {
    const { getByTestId, getByText } = render(
      <HoleMap
        hole={hole}
        gps={{ lat: 36.282, lng: -5.332 }}
        target={{ lat: 36.285, lng: -5.33 }}
        playerInitial="P"
        aimDistance={150}
        unit="m"
        onPressMap={jest.fn()}
      />,
    );
    expect(getByTestId('gps-marker')).toBeTruthy();
    expect(getByTestId('target-marker')).toBeTruthy();
    expect(getByText('150 m')).toBeTruthy();
  });

  it('sin objetivo no muestra marcador de objetivo', () => {
    const { queryByTestId } = render(
      <HoleMap
        hole={hole}
        gps={{ lat: 36.282, lng: -5.332 }}
        target={null}
        playerInitial="P"
        aimDistance={null}
        unit="m"
        onPressMap={jest.fn()}
      />,
    );
    expect(queryByTestId('target-marker')).toBeNull();
  });
});
