import type { TranslationKey } from '@/i18n/translations';

export type FieldErrors<T extends string> = Partial<Record<T, TranslationKey>>;

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]{6,25}$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length >= 5 && email.length <= 254 && EMAIL_PATTERN.test(email);
}

function lengthBetween(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

export type MembershipInput = {
  fullName: string;
  email: string;
  university: string;
  phone: string;
  level: string;
  yearsPlaying: string;
  fideRating: string;
  interests: string;
  message: string;
};

export function validateMembership(input: MembershipInput): FieldErrors<keyof MembershipInput> {
  const errors: FieldErrors<keyof MembershipInput> = {};
  const fullName = input.fullName.trim();
  const university = input.university.trim();
  const phone = input.phone.trim();
  const fide = input.fideRating.trim();

  if (!lengthBetween(fullName, 2, 100)) errors.fullName = 'errName';
  if (!isValidEmail(input.email)) errors.email = 'errEmail';
  if (!lengthBetween(university, 2, 120)) errors.university = 'errUniversity';
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = 'errPhone';
  if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(input.level)) errors.level = 'errLevel';
  if (fide && !(/^\d{1,4}$/.test(fide) && Number(fide) <= 3000)) errors.fideRating = 'errFide';
  if (input.interests.trim().length > 300) errors.interests = 'errTooLong';
  if (input.message.trim().length > 1000) errors.message = 'errTooLong';

  return errors;
}

export type RegistrationInput = {
  fullName: string;
  email: string;
  university: string;
  phone: string;
};

export function validateRegistration(input: RegistrationInput): FieldErrors<keyof RegistrationInput> {
  const errors: FieldErrors<keyof RegistrationInput> = {};
  const phone = input.phone.trim();

  if (!lengthBetween(input.fullName.trim(), 2, 100)) errors.fullName = 'errName';
  if (!isValidEmail(input.email)) errors.email = 'errEmail';
  if (!lengthBetween(input.university.trim(), 2, 120)) errors.university = 'errUniversity';
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = 'errPhone';

  return errors;
}

export function isSafeHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
