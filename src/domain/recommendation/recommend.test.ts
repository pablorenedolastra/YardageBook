import { recommendClub } from './recommend';
import { ClubMatrix } from '../models';

const matrix: ClubMatrix = {
  measuredContext: { month: 6, city: 'Madrid' },
  entries: [
    { clubId: 'pw', label: 'PW', carryDistance: 110, order: 1 },
    { clubId: '9i', label: 'Hierro 9', carryDistance: 125, order: 2 },
    { clubId: '8i', label: 'Hierro 8', carryDistance: 138, order: 3 },
    { clubId: '7i', label: 'Hierro 7', carryDistance: 150, order: 4 },
    { clubId: '6i', label: 'Hierro 6', carryDistance: 162, order: 5 },
  ],
};

describe('recommendClub', () => {
  it('elige el palo cuyo carry coincide con el objetivo (llano, sin meteo)', () => {
    const rec = recommendClub({ targetDistance: 150, matrix });
    expect(rec?.club.clubId).toBe('7i');
    expect(rec?.effectiveTarget).toBe(150);
    expect(rec?.adjustedCarry).toBe(150);
  });

  it('sube de palo cuesta arriba (el objetivo efectivo crece)', () => {
    const rec = recommendClub({ targetDistance: 150, elevationChange: 10, matrix });
    expect(rec?.club.clubId).toBe('6i');
    expect(rec?.effectiveTarget).toBe(160);
  });

  it('aplica meteo cuando se pasan baseline y actual (Plays Like ON)', () => {
    const rec = recommendClub({
      targetDistance: 150,
      matrix,
      baselineWeather: { temperatureC: 20, humidityPct: 50 },
      currentWeather: { temperatureC: 30, humidityPct: 50 },
    });
    // El 7i (150) escala por 1.012 -> 151.8; sigue siendo el más cercano a 150.
    expect(rec?.club.clubId).toBe('7i');
    expect(rec?.adjustedCarry).toBeCloseTo(151.8, 4);
  });

  it('devuelve null si la matriz no tiene palos', () => {
    const empty: ClubMatrix = { measuredContext: { month: 6, city: 'Madrid' }, entries: [] };
    const rec = recommendClub({ targetDistance: 150, matrix: empty });
    expect(rec).toBeNull();
  });
});
