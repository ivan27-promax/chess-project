import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { FormField, Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { submitMembershipRequest, type MembershipPayload } from '@/lib/publicApi';
import { validateMembership, type FieldErrors, type MembershipInput } from '@/lib/validation';
import { LEVEL_KEYS, YEARS_KEYS } from '@/lib/labels';

const EMPTY_FORM: MembershipInput = {
  fullName: '',
  email: '',
  university: '',
  phone: '',
  level: '',
  yearsPlaying: '',
  fideRating: '',
  interests: '',
  message: '',
};

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
const YEARS = ['under_1', '1_3', '3_5', 'over_5'] as const;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function MembershipPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState<MembershipInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<keyof MembershipInput>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<TranslationKey>('errGeneric');

  const update = (field: keyof MembershipInput) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateMembership(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setStatus('submitting');
    const payload: MembershipPayload = {
      ...form,
      level: form.level as MembershipPayload['level'],
      yearsPlaying: form.yearsPlaying as MembershipPayload['yearsPlaying'],
    };
    const result = await submitMembershipRequest(payload);
    if (result.ok) {
      setForm(EMPTY_FORM);
      setStatus('success');
    } else {
      setErrorKey(result.errorKey);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" aria-hidden="true" />
        <h1 className="mt-6 text-3xl">{t('membershipSuccessTitle')}</h1>
        <p className="mt-4 text-lg text-muted">{t('membershipSuccessBody')}</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn-secondary mt-8">
          {t('submitAnother')}
        </button>
      </section>
    );
  }

  const inputClass = 'input';

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">{t('navMembership')}</p>
      <h1 className="mt-3 text-4xl">{t('membershipTitle')}</h1>
      <p className="mt-4 text-lg text-muted">{t('membershipIntro')}</p>

      <form noValidate onSubmit={handleSubmit} className="card mt-10 space-y-10">
        {status === 'error' && <Notice tone="error">{t(errorKey)}</Notice>}

        <fieldset className="space-y-6">
          <legend className="mb-4 text-xl font-bold">{t('sectionPersonal')}</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label={t('fieldFullName')} htmlFor="fullName" required error={errors.fullName && t(errors.fullName)}>
              <input
                id="fullName"
                name="fullName"
                autoComplete="name"
                className={inputClass}
                value={form.fullName}
                onChange={(event) => update('fullName')(event.target.value)}
                aria-invalid={Boolean(errors.fullName)}
              />
            </FormField>
            <FormField label={t('fieldEmail')} htmlFor="email" required error={errors.email && t(errors.email)}>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                className={inputClass}
                value={form.email}
                onChange={(event) => update('email')(event.target.value)}
                aria-invalid={Boolean(errors.email)}
              />
            </FormField>
            <FormField label={t('fieldUniversity')} htmlFor="university" required error={errors.university && t(errors.university)}>
              <input
                id="university"
                name="university"
                autoComplete="organization"
                className={inputClass}
                value={form.university}
                onChange={(event) => update('university')(event.target.value)}
                aria-invalid={Boolean(errors.university)}
              />
            </FormField>
            <FormField label={`${t('fieldPhone')} (${t('optional')})`} htmlFor="phone" error={errors.phone && t(errors.phone)}>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                dir="ltr"
                className={inputClass}
                value={form.phone}
                onChange={(event) => update('phone')(event.target.value)}
                aria-invalid={Boolean(errors.phone)}
              />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="mb-4 text-xl font-bold">{t('sectionChess')}</legend>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label={t('fieldLevel')} htmlFor="level" required error={errors.level && t(errors.level)}>
              <select
                id="level"
                name="level"
                className={inputClass}
                value={form.level}
                onChange={(event) => update('level')(event.target.value)}
                aria-invalid={Boolean(errors.level)}
              >
                <option value="">{t('required')}</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t(LEVEL_KEYS[level])}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={`${t('fieldYears')} (${t('optional')})`} htmlFor="yearsPlaying">
              <select
                id="yearsPlaying"
                name="yearsPlaying"
                className={inputClass}
                value={form.yearsPlaying}
                onChange={(event) => update('yearsPlaying')(event.target.value)}
              >
                <option value="">-</option>
                {YEARS.map((years) => (
                  <option key={years} value={years}>
                    {t(YEARS_KEYS[years])}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={`${t('fieldFide')} (${t('optional')})`} htmlFor="fideRating" error={errors.fideRating && t(errors.fideRating)}>
              <input
                id="fideRating"
                name="fideRating"
                inputMode="numeric"
                dir="ltr"
                className={inputClass}
                value={form.fideRating}
                onChange={(event) => update('fideRating')(event.target.value)}
                aria-invalid={Boolean(errors.fideRating)}
              />
            </FormField>
            <FormField
              label={`${t('fieldInterests')} (${t('optional')})`}
              htmlFor="interests"
              hint={t('fieldInterestsHint')}
              error={errors.interests && t(errors.interests)}
            >
              <input
                id="interests"
                name="interests"
                className={inputClass}
                value={form.interests}
                onChange={(event) => update('interests')(event.target.value)}
                aria-invalid={Boolean(errors.interests)}
              />
            </FormField>
          </div>
          <FormField label={`${t('fieldMessage')} (${t('optional')})`} htmlFor="message" error={errors.message && t(errors.message)}>
            <textarea
              id="message"
              name="message"
              rows={4}
              className={inputClass}
              value={form.message}
              onChange={(event) => update('message')(event.target.value)}
              aria-invalid={Boolean(errors.message)}
            />
          </FormField>
        </fieldset>

        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm text-muted">{t('privacyNote')}</p>
          <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
            {status === 'submitting' ? t('submitting') : t('submit')}
          </button>
        </div>
      </form>
    </section>
  );
}
