import { DistanceUnit } from './units';

/** Perfil del jugador. Vive solo en el dispositivo. */
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Código o nombre de país. */
  country: string;
  /** Hándicap (admite decimales). Opcional. */
  handicap?: number;
  /** Unidad en la que se expresan todas las distancias del perfil. */
  unit: DistanceUnit;
}

/** Perfil sin id, tal cual se recoge en el formulario antes de persistir. */
export type ProfileDraft = Omit<Profile, 'id'>;
