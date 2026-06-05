import { LatLng } from './geo';

/** Información del green de un hoyo. */
export interface GreenInfo {
  /** Centro del green (centroide del polígono OSM golf=green). MVP usa esto. */
  center: LatLng;
  /** Contorno del green, para dibujarlo en el mapa. Opcional. */
  polygon?: LatLng[];
}

/** Un hoyo del campo. */
export interface Hole {
  /** Número de hoyo, 1..18 (o 1..9). */
  ref: number;
  /** Par del hoyo, si OSM lo trae. */
  par?: number;
  /** Stroke index / hándicap del hoyo (S.I.), si OSM lo trae. */
  strokeIndex?: number;
  /** Green del hoyo (siempre presente si el hoyo se incluye). */
  green: GreenInfo;
  /** Puntos de tee del hoyo (varios). Para encuadrar el mapa. */
  tees: LatLng[];
  /** Línea de juego tee→green. Para encuadre y dibujo. */
  playLine: LatLng[];
}

/** Un campo de golf normalizado. */
export interface Course {
  /** Id estable, ej. "osm-way-237391513". */
  id: string;
  /** Nombre del campo. */
  name: string;
  /** Origen del dato. */
  source: 'osm';
  /** Centro del campo (listado, búsqueda y encuadre inicial). */
  location: LatLng;
  /** Nº de hoyos con datos. */
  holeCount: number;
  holes: Hole[];
  /** Texto de atribución obligatorio (ODbL). */
  attribution: string;
}
