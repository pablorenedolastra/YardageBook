/** Una fila de la matriz de palos: un palo y su distancia de carry medida. */
export interface ClubMatrixEntry {
  /** Identificador estable del palo, ej. "7i", "pw", "driver". */
  clubId: string;
  /** Etiqueta visible para el usuario, ej. "Hierro 7". */
  label: string;
  /** Distancia de carry medida, en la unidad del perfil. */
  carryDistance: number;
  /** Orden de presentación (ascendente, driver→wedges). */
  order: number;
}

/** Contexto en que se midieron las distancias de la matriz. */
export interface MeasuredContext {
  /** Mes (1-12) en que se midieron. */
  month: number;
  /** Ciudad donde se midieron. */
  city: string;
}

/** Matriz de palos del jugador, con el contexto en que se midió. */
export interface ClubMatrix {
  /** Mes + ciudad en que se midieron TODAS las distancias de la matriz. */
  measuredContext: MeasuredContext;
  entries: ClubMatrixEntry[];
}
