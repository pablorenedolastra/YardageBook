import { WeatherConditions } from './weather';

/** Una fila de la matriz de palos: un palo y su distancia de carry medida. */
export interface ClubMatrixEntry {
  /** Identificador estable del palo, ej. "7-iron", "PW", "driver". */
  clubId: string;
  /** Etiqueta visible para el usuario, ej. "Hierro 7". */
  label: string;
  /** Distancia de carry medida, en la unidad del perfil. */
  carryDistance: number;
  /** Orden de presentación (ascendente). */
  order: number;
}

/** Matriz de palos del jugador, con las condiciones base en que se midió. */
export interface ClubMatrix {
  /** Condiciones meteo en las que se midieron TODAS las distancias de la matriz. */
  baseline: WeatherConditions;
  entries: ClubMatrixEntry[];
}
