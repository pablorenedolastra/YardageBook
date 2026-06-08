/** Catálogo canónico de palos para el ClubPickerSheet (UX §5.5). */
export type ClubGroup = 'Maderas' | 'Híbridos' | 'Hierros' | 'Wedges';

export interface CatalogClub {
  clubId: string;
  label: string;
  group: ClubGroup;
  /** Orden estable driver→wedges. */
  order: number;
}

export const CLUB_CATALOG: CatalogClub[] = [
  { clubId: 'driver', label: 'Driver', group: 'Maderas', order: 1 },
  { clubId: '3w', label: 'Madera 3', group: 'Maderas', order: 2 },
  { clubId: '5w', label: 'Madera 5', group: 'Maderas', order: 3 },
  { clubId: '3h', label: 'Híbrido 3', group: 'Híbridos', order: 4 },
  { clubId: '4h', label: 'Híbrido 4', group: 'Híbridos', order: 5 },
  { clubId: '5h', label: 'Híbrido 5', group: 'Híbridos', order: 6 },
  { clubId: '4i', label: 'Hierro 4', group: 'Hierros', order: 7 },
  { clubId: '5i', label: 'Hierro 5', group: 'Hierros', order: 8 },
  { clubId: '6i', label: 'Hierro 6', group: 'Hierros', order: 9 },
  { clubId: '7i', label: 'Hierro 7', group: 'Hierros', order: 10 },
  { clubId: '8i', label: 'Hierro 8', group: 'Hierros', order: 11 },
  { clubId: '9i', label: 'Hierro 9', group: 'Hierros', order: 12 },
  { clubId: 'pw', label: 'PW', group: 'Wedges', order: 13 },
  { clubId: 'gw', label: 'GW', group: 'Wedges', order: 14 },
  { clubId: 'sw', label: 'SW', group: 'Wedges', order: 15 },
  { clubId: 'lw', label: 'LW', group: 'Wedges', order: 16 },
];

const GROUP_ORDER: ClubGroup[] = ['Maderas', 'Híbridos', 'Hierros', 'Wedges'];

/** Devuelve el catálogo agrupado, en el orden de grupos del spec. */
export function clubsByGroup(): { group: ClubGroup; clubs: CatalogClub[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    clubs: CLUB_CATALOG.filter((c) => c.group === group),
  }));
}

/** Orden de catálogo de un clubId (los personalizados van al final). */
export function catalogOrder(clubId: string): number {
  return CLUB_CATALOG.find((c) => c.clubId === clubId)?.order ?? 999;
}
