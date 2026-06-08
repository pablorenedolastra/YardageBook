import {
  ProfileFormValues,
  validateProfileForm,
  isProfileFormValid,
  toProfileDraft,
  profileToFormValues,
} from './profile-form';
import { Profile } from '../../domain';

const valid: ProfileFormValues = {
  firstName: 'Pablo',
  lastName: 'Renedo',
  email: 'pablo@example.com',
  country: 'ES',
  handicap: '12,4',
  unit: 'meters',
};

describe('validateProfileForm', () => {
  it('no devuelve errores para un formulario válido', () => {
    expect(validateProfileForm(valid)).toEqual({});
    expect(isProfileFormValid(valid)).toBe(true);
  });

  it('exige los campos obligatorios', () => {
    const errors = validateProfileForm({
      firstName: '  ',
      lastName: '',
      email: '',
      country: '',
      handicap: '',
      unit: 'meters',
    });
    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.country).toBeDefined();
    expect(isProfileFormValid({ ...valid, firstName: '' })).toBe(false);
  });

  it('rechaza un email mal formado', () => {
    expect(validateProfileForm({ ...valid, email: 'pablo@nope' }).email).toBeDefined();
  });

  it('acepta hándicap vacío (opcional)', () => {
    expect(validateProfileForm({ ...valid, handicap: '' }).handicap).toBeUndefined();
  });

  it('rechaza hándicap fuera de rango', () => {
    expect(validateProfileForm({ ...valid, handicap: '60' }).handicap).toBeDefined();
    expect(validateProfileForm({ ...valid, handicap: '-20' }).handicap).toBeDefined();
  });

  it('rechaza hándicap no numérico', () => {
    expect(validateProfileForm({ ...valid, handicap: 'abc' }).handicap).toBeDefined();
  });
});

describe('profileToFormValues', () => {
  it('convierte un Profile en valores de formulario', () => {
    const profile: Profile = {
      id: 'p1',
      firstName: 'Pablo',
      lastName: 'Renedo',
      email: 'pablo@example.com',
      country: 'ES',
      handicap: 12.4,
      unit: 'yards',
    };
    expect(profileToFormValues(profile)).toEqual({
      firstName: 'Pablo',
      lastName: 'Renedo',
      email: 'pablo@example.com',
      country: 'ES',
      handicap: '12.4',
      unit: 'yards',
    });
  });

  it('deja el hándicap vacío si no está definido', () => {
    const profile: Profile = {
      id: 'p1',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      country: 'ES',
      unit: 'meters',
    };
    expect(profileToFormValues(profile).handicap).toBe('');
  });
});

describe('toProfileDraft', () => {
  it('parsea la coma decimal del hándicap y recorta espacios', () => {
    const draft = toProfileDraft({ ...valid, firstName: ' Pablo ', handicap: '12,4' });
    expect(draft.firstName).toBe('Pablo');
    expect(draft.handicap).toBeCloseTo(12.4, 5);
    expect(draft.unit).toBe('meters');
  });

  it('omite el hándicap si está vacío', () => {
    const draft = toProfileDraft({ ...valid, handicap: '   ' });
    expect(draft.handicap).toBeUndefined();
  });
});
