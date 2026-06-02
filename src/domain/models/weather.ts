/** Condiciones meteo relevantes para el vuelo de la bola (v1: temp + humedad). */
export interface WeatherConditions {
  /** Temperatura en grados Celsius. */
  temperatureC: number;
  /** Humedad relativa en porcentaje, 0-100. */
  humidityPct: number;
}
