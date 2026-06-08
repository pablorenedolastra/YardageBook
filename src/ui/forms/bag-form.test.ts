import {
  emptyBag,
  addClubFromCatalog,
  addCustomClub,
  removeEntry,
  setEntryDistance,
  validateBag,
  isBagValid,
  toClubMatrix,
} from './bag-form';
import { CLUB_CATALOG } from './clubs';

const driver = CLUB_CATALOG.find((c) => c.clubId === 'driver')!;
const i7 = CLUB_CATALOG.find((c) => c.clubId === '7i')!;

describe('bag draft', () => {
  it('emptyBag arranca sin palos', () => {
    const bag = emptyBag(6, 'Madrid');
    expect(bag.entries).toHaveLength(0);
    expect(bag.month).toBe(6);
    expect(bag.city).toBe('Madrid');
  });

  it('añade palos del catálogo y los ordena por order', () => {
    let bag = emptyBag(6, 'Madrid');
    bag = addClubFromCatalog(bag, i7);
    bag = addClubFromCatalog(bag, driver);
    expect(bag.entries.map((e) => e.clubId)).toEqual(['driver', '7i']);
  });

  it('no duplica un palo ya añadido', () => {
    let bag = addClubFromCatalog(emptyBag(6, 'Madrid'), i7);
    bag = addClubFromCatalog(bag, i7);
    expect(bag.entries).toHaveLength(1);
  });

  it('añade palos personalizados con id único', () => {
    let bag = addCustomClub(emptyBag(6, 'Madrid'), 'Driving iron');
    bag = addCustomClub(bag, 'Chipper');
    const ids = bag.entries.map((e) => e.clubId);
    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => id.startsWith('custom-'))).toBe(true);
  });

  it('quita un palo y edita su distancia', () => {
    let bag = addClubFromCatalog(emptyBag(6, 'Madrid'), i7);
    bag = setEntryDistance(bag, '7i', '150');
    expect(bag.entries[0].distance).toBe('150');
    bag = removeEntry(bag, '7i');
    expect(bag.entries).toHaveLength(0);
  });

  it('marca error en distancias no válidas, pero no en vacías', () => {
    let bag = addClubFromCatalog(emptyBag(6, 'Madrid'), i7);
    bag = addClubFromCatalog(bag, driver);
    bag = setEntryDistance(bag, '7i', '0');
    bag = setEntryDistance(bag, 'driver', '');
    const { entryErrors } = validateBag(bag);
    expect(entryErrors['7i']).toBeDefined();
    expect(entryErrors['driver']).toBeUndefined();
  });

  it('es válida con al menos un palo con distancia > 0 y sin errores', () => {
    let bag = addClubFromCatalog(emptyBag(6, 'Madrid'), i7);
    expect(isBagValid(bag)).toBe(false); // sin distancia aún
    bag = setEntryDistance(bag, '7i', '150');
    expect(isBagValid(bag)).toBe(true);
    bag = addClubFromCatalog(bag, driver);
    bag = setEntryDistance(bag, 'driver', '-5');
    expect(isBagValid(bag)).toBe(false); // hay un error
  });

  it('toClubMatrix filtra vacíos, parsea coma decimal y ordena', () => {
    let bag = emptyBag(6, ' Madrid ');
    bag = addClubFromCatalog(bag, i7);
    bag = addClubFromCatalog(bag, driver);
    bag = setEntryDistance(bag, '7i', '150,5');
    bag = setEntryDistance(bag, 'driver', '230');
    const matrix = toClubMatrix(bag);
    expect(matrix.measuredContext).toEqual({ month: 6, city: 'Madrid' });
    expect(matrix.entries.map((e) => e.clubId)).toEqual(['driver', '7i']);
    expect(matrix.entries.find((e) => e.clubId === '7i')!.carryDistance).toBeCloseTo(150.5, 5);
  });
});
