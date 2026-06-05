import { haversineMeters } from './distance';
import { LatLng } from '../models';

const origin: LatLng = { lat: 0, lng: 0 };

describe('haversineMeters', () => {
  it('es 0 entre un punto y sí mismo', () => {
    expect(haversineMeters(origin, origin)).toBe(0);
  });

  it('un grado de latitud en el ecuador ≈ 111.2 km', () => {
    const d = haversineMeters(origin, { lat: 1, lng: 0 });
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(111400);
  });

  it('un grado de longitud en el ecuador ≈ 111.2 km', () => {
    const d = haversineMeters(origin, { lat: 0, lng: 1 });
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(111400);
  });

  it('es simétrica', () => {
    const a: LatLng = { lat: 36.28, lng: -5.34 };
    const b: LatLng = { lat: 36.29, lng: -5.33 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6);
  });
});
