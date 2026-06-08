/**
 * Lista curada de países para el selector del perfil (v1).
 * No pretende ser exhaustiva: cubre España y los países de golf / UE más
 * habituales. Ampliable sin cambiar la interfaz del CountryPicker.
 */
export interface Country {
  /** Código ISO 3166-1 alfa-2. */
  code: string;
  /** Nombre en español. */
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'FR', name: 'Francia' },
  { code: 'IT', name: 'Italia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'CH', name: 'Suiza' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Suecia' },
  { code: 'NO', name: 'Noruega' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'PL', name: 'Polonia' },
  { code: 'CZ', name: 'Chequia' },
  { code: 'GR', name: 'Grecia' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'CA', name: 'Canadá' },
  { code: 'MX', name: 'México' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'Nueva Zelanda' },
  { code: 'ZA', name: 'Sudáfrica' },
  { code: 'JP', name: 'Japón' },
  { code: 'KR', name: 'Corea del Sur' },
  { code: 'AE', name: 'Emiratos Árabes Unidos' },
  { code: 'MA', name: 'Marruecos' },
];

/** Nombre del país por código; devuelve el propio código si no se conoce. */
export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
