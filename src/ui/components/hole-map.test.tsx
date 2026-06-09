import { render } from '@testing-library/react-native';
import { HoleMap } from './hole-map';
import type { Hole } from '../../domain';

const green = { lat: 36.285, lng: -5.33 };
const hole: Hole = {
  ref: 1,
  par: 4,
  strokeIndex: 5,
  green: {
    center: green,
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
  it('con el objetivo movido muestra GPS, objetivo y las dos distancias', () => {
    const { getByTestId, getByText } = render(
      <HoleMap
        hole={hole}
        gps={{ lat: 36.282, lng: -5.332 }}
        target={{ lat: 36.2835, lng: -5.331 }}
        playerInitial="P"
        aimDistance={150}
        toGreenDistance={42}
        unit="m"
        onMoveTarget={jest.fn()}
      />,
    );
    expect(getByTestId('gps-marker')).toBeTruthy();
    expect(getByTestId('target-marker')).toBeTruthy();
    expect(getByText('150 m')).toBeTruthy(); // GPS → objetivo
    expect(getByText('42 m')).toBeTruthy(); // objetivo → green
  });

  it('con el objetivo en el centro del green no dibuja la 2ª distancia', () => {
    const { getByText, queryByText } = render(
      <HoleMap
        hole={hole}
        gps={{ lat: 36.282, lng: -5.332 }}
        target={green}
        playerInitial="P"
        aimDistance={170}
        toGreenDistance={0}
        unit="m"
        onMoveTarget={jest.fn()}
      />,
    );
    expect(getByText('170 m')).toBeTruthy();
    expect(queryByText('0 m')).toBeNull(); // objetivo == green → sin 2ª línea
  });

  it('sin objetivo no muestra el marcador de objetivo', () => {
    const { queryByTestId } = render(
      <HoleMap
        hole={hole}
        gps={{ lat: 36.282, lng: -5.332 }}
        target={null}
        playerInitial="P"
        aimDistance={null}
        toGreenDistance={null}
        unit="m"
        onMoveTarget={jest.fn()}
      />,
    );
    expect(queryByTestId('target-marker')).toBeNull();
  });
});
