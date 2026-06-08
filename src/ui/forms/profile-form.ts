import { DistanceUnit, Profile, ProfileDraft } from '../../domain';

/** Valores en bruto del formulario de perfil (todo texto salvo la unidad). */
export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  handicap: string;
  unit: DistanceUnit;
}

/** Errores por campo (la unidad siempre es válida: tiene valor por defecto). */
export type ProfileFormErrors = Partial<Record<keyof Omit<ProfileFormValues, 'unit'>, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDICAP_MIN = -10;
const HANDICAP_MAX = 54;

/** Valida los campos del formulario de perfil. Hándicap es opcional. */
export function validateProfileForm(v: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  if (!v.firstName.trim()) errors.firstName = 'Introduce tu nombre';
  if (!v.lastName.trim()) errors.lastName = 'Introduce tus apellidos';
  if (!v.email.trim()) errors.email = 'Introduce tu email';
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = 'Email no válido';
  if (!v.country.trim()) errors.country = 'Selecciona tu país';
  if (v.handicap.trim()) {
    const h = Number(v.handicap.replace(',', '.'));
    if (Number.isNaN(h)) errors.handicap = 'Hándicap no válido';
    else if (h < HANDICAP_MIN || h > HANDICAP_MAX)
      errors.handicap = `Hándicap entre ${HANDICAP_MIN} y ${HANDICAP_MAX}`;
  }
  return errors;
}

/** ¿El formulario es válido (sin errores)? */
export function isProfileFormValid(v: ProfileFormValues): boolean {
  return Object.keys(validateProfileForm(v)).length === 0;
}

/** Convierte un Profile guardado en valores de formulario (para editar). */
export function profileToFormValues(p: Profile): ProfileFormValues {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    country: p.country,
    handicap: p.handicap !== undefined ? String(p.handicap) : '',
    unit: p.unit,
  };
}

/** Convierte los valores del formulario en un ProfileDraft normalizado. */
export function toProfileDraft(v: ProfileFormValues): ProfileDraft {
  const handicap = v.handicap.trim() ? Number(v.handicap.replace(',', '.')) : undefined;
  return {
    firstName: v.firstName.trim(),
    lastName: v.lastName.trim(),
    email: v.email.trim(),
    country: v.country.trim(),
    handicap,
    unit: v.unit,
  };
}
