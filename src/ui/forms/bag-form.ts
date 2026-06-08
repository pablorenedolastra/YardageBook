import { ClubMatrix } from '../../domain';
import { CatalogClub, catalogOrder } from './clubs';

/** Una fila editable de la bolsa (distancia como texto durante la edición). */
export interface BagEntryDraft {
  clubId: string;
  label: string;
  distance: string;
  order: number;
}

/** Estado editable de la bolsa: palos + contexto de medición. */
export interface BagDraft {
  entries: BagEntryDraft[];
  month: number;
  city: string;
}

const CUSTOM_PREFIX = 'custom-';

/** Bolsa vacía con el contexto de medición indicado. */
export function emptyBag(month: number, city = ''): BagDraft {
  return { entries: [], month, city };
}

/** Parsea una distancia introducida (admite coma decimal). null si no es número. */
export function parseDistance(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const n = Number(trimmed.replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function sortEntries(entries: BagEntryDraft[]): BagEntryDraft[] {
  return [...entries].sort((a, b) => a.order - b.order);
}

/** Añade un palo del catálogo (no-op si ya está). */
export function addClubFromCatalog(bag: BagDraft, club: CatalogClub): BagDraft {
  if (bag.entries.some((e) => e.clubId === club.clubId)) return bag;
  const entry: BagEntryDraft = {
    clubId: club.clubId,
    label: club.label,
    distance: '',
    order: club.order,
  };
  return { ...bag, entries: sortEntries([...bag.entries, entry]) };
}

/** Añade un palo personalizado con id único e incremental. */
export function addCustomClub(bag: BagDraft, label: string): BagDraft {
  const used = bag.entries
    .filter((e) => e.clubId.startsWith(CUSTOM_PREFIX))
    .map((e) => Number(e.clubId.slice(CUSTOM_PREFIX.length)))
    .filter((n) => !Number.isNaN(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  const entry: BagEntryDraft = {
    clubId: `${CUSTOM_PREFIX}${next}`,
    label: label.trim() || `Personalizado ${next}`,
    distance: '',
    order: 900 + next,
  };
  return { ...bag, entries: sortEntries([...bag.entries, entry]) };
}

/** Quita un palo por clubId. */
export function removeEntry(bag: BagDraft, clubId: string): BagDraft {
  return { ...bag, entries: bag.entries.filter((e) => e.clubId !== clubId) };
}

/** Cambia la distancia (texto) de un palo. */
export function setEntryDistance(bag: BagDraft, clubId: string, distance: string): BagDraft {
  return {
    ...bag,
    entries: bag.entries.map((e) => (e.clubId === clubId ? { ...e, distance } : e)),
  };
}

export interface BagValidation {
  /** Errores por clubId (distancia introducida pero no válida). */
  entryErrors: Record<string, string>;
  /** Nº de palos con distancia > 0. */
  validCount: number;
}

/** Valida la bolsa: distancias introducidas deben ser > 0; las vacías se ignoran. */
export function validateBag(bag: BagDraft): BagValidation {
  const entryErrors: Record<string, string> = {};
  let validCount = 0;
  for (const e of bag.entries) {
    if (e.distance.trim() === '') continue;
    const d = parseDistance(e.distance);
    if (d === null || d <= 0) entryErrors[e.clubId] = 'Distancia no válida';
    else validCount += 1;
  }
  return { entryErrors, validCount };
}

/** ¿Bolsa válida? Al menos un palo con distancia > 0 y sin errores. */
export function isBagValid(bag: BagDraft): boolean {
  const { entryErrors, validCount } = validateBag(bag);
  return Object.keys(entryErrors).length === 0 && validCount >= 1;
}

/** Construye un BagDraft editable a partir de una ClubMatrix guardada. */
export function bagFromMatrix(matrix: ClubMatrix): BagDraft {
  return {
    month: matrix.measuredContext.month,
    city: matrix.measuredContext.city,
    entries: [...matrix.entries]
      .sort((a, b) => a.order - b.order)
      .map((e) => ({
        clubId: e.clubId,
        label: e.label,
        distance: String(e.carryDistance),
        order: e.order,
      })),
  };
}

/** Convierte la bolsa en una ClubMatrix (solo palos con distancia > 0, ordenados). */
export function toClubMatrix(bag: BagDraft): ClubMatrix {
  const entries = bag.entries
    .map((e) => ({ e, d: parseDistance(e.distance) }))
    .filter((x): x is { e: BagEntryDraft; d: number } => x.d !== null && x.d > 0)
    .map(({ e, d }) => ({
      clubId: e.clubId,
      label: e.label,
      carryDistance: d,
      order: catalogOrder(e.clubId) === 999 ? e.order : catalogOrder(e.clubId),
    }))
    .sort((a, b) => a.order - b.order);

  return {
    measuredContext: { month: bag.month, city: bag.city.trim() },
    entries,
  };
}
