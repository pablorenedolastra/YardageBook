import { recommendClub } from './recommend';
import { ClubMatrix } from '../models';

const matrix: ClubMatrix = {
  baseline: { temperatureC: 20, humidityPct: 50 },
  entries: [
    { clubId: 'pw', label: 'PW', carryDistance: 110, order: 1 },
    { clubId: '9i', label: 'Hierro 9', carryDistance: 125, order: 2 },
    { clubId: '8i', label: 'Hierro 8', carryDistance: 138, order: 3 },
    { clubId: '7i', label: 'Hierro 7', carryDistance: 150, order: 4 },
    { clubId: '6i', label: 'Hierro 6', carryDistance: 162, order: 5 },
  ],
};

describe('recommendClub', () => {
  it('elige el palo cuyo carry coincide con el objetivo (llano, meteo = base)', () => {
    const rec = recommendClub({
      targetDistance: 150,
      elevationChange: 0,
      currentWeather: { temperatureC: 20, humidityPct: 50 },
      matrix,
    });
    expect(rec?.club.clubId).toBe('7i');
    expect(rec?.effectiveTarget).toBe(150);
    expect(rec?.adjustedCarry).toBeCloseTo(150, 5);
  });

  it('sube de palo cuesta arriba (el objetivo efectivo crece)', () => {
    const rec = recommendClub({
      targetDistance: 150,
      elevationChange: 10, // objetivo efectivo = 160 -> más cerca del 6i (162)
      currentWeather: { temperatureC: 20, humidityPct: 50 },
      matrix,
    });
    expect(rec?.club.clubId).toBe('6i');
    expect(rec?.effectiveTarget).toBe(160);
  });

  it('devuelve null si la matriz no tiene palos', () => {
    const empty: ClubMatrix = { baseline: { temperatureC: 20, humidityPct: 50 }, entries: [] };
    const rec = recommendClub({
      targetDistance: 150,
      elevationChange: 0,
      currentWeather: { temperatureC: 20, humidityPct: 50 },
      matrix: empty,
    });
    expect(rec).toBeNull();
  });
});
