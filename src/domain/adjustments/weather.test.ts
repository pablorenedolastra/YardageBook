import { adjustCarryForWeather } from './weather';
import { WeatherConditions } from '../models';

const baseline: WeatherConditions = { temperatureC: 20, humidityPct: 50 };

describe('adjustCarryForWeather', () => {
  it('no cambia el carry si las condiciones son idénticas a la base', () => {
    const current: WeatherConditions = { temperatureC: 20, humidityPct: 50 };
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(150, 5);
  });

  it('aumenta el carry cuando hace más calor que en la base', () => {
    const current: WeatherConditions = { temperatureC: 30, humidityPct: 50 };
    // factor = 1 + (30-20)*0.0012 = 1.012 -> 151.8
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(151.8, 4);
  });

  it('aumenta el carry cuando hay más humedad que en la base', () => {
    const current: WeatherConditions = { temperatureC: 20, humidityPct: 80 };
    // factor = 1 + (80-50)*0.0002 = 1.006 -> 150.9
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(150.9, 4);
  });

  it('reduce el carry cuando hace más frío que en la base', () => {
    const current: WeatherConditions = { temperatureC: 10, humidityPct: 50 };
    // factor = 1 + (10-20)*0.0012 = 0.988 -> 148.2
    expect(adjustCarryForWeather(150, baseline, current)).toBeCloseTo(148.2, 4);
  });
});
