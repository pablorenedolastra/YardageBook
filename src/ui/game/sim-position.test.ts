import { simulatedTeePosition } from './sim-position';
import type { Hole } from '../../domain';

const base = {
  ref: 1,
  green: { center: { lat: 36.285, lng: -5.33 } },
};

describe('simulatedTeePosition', () => {
  it('usa el primer tee si existe', () => {
    const hole: Hole = {
      ...base,
      tees: [{ lat: 36.282, lng: -5.332 }],
      playLine: [],
    };
    expect(simulatedTeePosition(hole)).toEqual({ lat: 36.282, lng: -5.332 });
  });

  it('sin tees, usa el extremo de la línea de juego más lejano al green', () => {
    const far = { lat: 36.281, lng: -5.333 }; // lejos del green
    const near = { lat: 36.2849, lng: -5.3299 }; // pegado al green
    const hole: Hole = {
      ...base,
      tees: [],
      playLine: [far, near], // first lejano, last cercano → debe elegir el lejano
    };
    expect(simulatedTeePosition(hole)).toEqual(far);
  });

  it('sin tees ni línea, cae al centro del green', () => {
    const hole: Hole = { ...base, tees: [], playLine: [] };
    expect(simulatedTeePosition(hole)).toEqual(base.green.center);
  });
});
