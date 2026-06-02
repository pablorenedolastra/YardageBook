import { DistanceUnit } from './units';

/** Perfil del jugador. Vive solo en el dispositivo. */
export interface Profile {
  id: string;
  name: string;
  /** Unidad en la que se expresan todas las distancias del perfil. */
  unit: DistanceUnit;
}
