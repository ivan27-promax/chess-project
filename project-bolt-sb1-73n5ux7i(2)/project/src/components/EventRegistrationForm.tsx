import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { FormField, Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { registerForEvent, type RegistrationPayload } from '@/lib/publicApi';
import type { EventState } from '@/lib/events';
import { validateRegistration, type FieldErrors, type RegistrationInput } from '@/lib/validation';
import type { RegistrationStatus } from '@/types/club';

const EMPTY_FORM: RegistrationInput = { fullName: '', email: '', university: '', phone: '' };

type Props = {
  eventId: string;
  state: EventState;
  onRegistered: () => void;
};

export function EventRegistrationForm({ eventId, state, onRegistered }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<RegistrationInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors<keyof RegistrationInput>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<TranslationKey | null>(null);
  const [result, setResult] = useState<RegistrationStatus | null>(null);

  const isWaitlistOnly = state === 'full';

  const update = (field: keyof RegistrationInput) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateRegistration(form);
    setErrors(found);
    const firstError = Object.keys(found)[0];
    if (firstError) {
      document.getElementById(`reg-${firstError}`)?.focus();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    const payload: RegistrationPayload = { eventId, ...form };
    const outcome = await registerForEvent(payload);
    setSubmitting(false);

    if (outcome.ok) {
      setResult(outcome.data);
      setForm(EMPTY_FORM);
      onRegistered();
    } else {
      setServerError(outcome.errorKey);
    }
  };

  if (result) {
    const confirmed = result === 'confirmed';
    return (
      <div className="flex flex-col items-start gap-4" role="status">
        {confirmed ? (
          <CheckCircle2 className="h-12 w-12 text-success" aria-hidden="true" />
        ) : (
          <Clock className="h-12 w-12 text-warning" aria-hidden="true" />
        )}
        <h3 className="text-2xl">{confirmed ? t('registrationConfirmedTitle') : t('registrationWaitlistedTitle')}</h3>
        <p className="text-muted">{confirmed ? t('registrationConfirmedBody') : t('registrationWaitlistedBody')}</p>
      </div>
    );
  }

  if (state === 'past' || state === 'closed') {
    return <p className="text-muted">{state === 'past' ? t('registerPast') : t('registerClosed')}</p>;
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-6">
      {isWaitlistOnly && <Notice tone="success">{t('registerWaitlistNote')}</Notice>}
      {serverError && <Notice tone="error">{t(serverError)}</Notice>}

      <FormField label={t('fieldFullName')} htmlFor="reg-fullName" required error={errors.fullName && t(errors.fullName)}>
        <input
          id="reg-fullName"
          name="fullName"
          autoComplete="name"
          className="input"
          value={form.fullName}
          onChange={(event) => update('fullName')(event.target.value)}
          aria-invalid={Boolean(errors.fullName)}
        />
      </FormField>
      <FormField label={t('fieldEmail')} htmlFor="reg-email" required error={errors.email && t(errors.email)}>
        <input
          id="reg-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          className="input"
          value={form.email}
          onChange={(event) => update('email')(event.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
      </FormField>
      <FormField label={t('fieldUniversity')} htmlFor="reg-university" required error={errors.university && t(errors.university)}>
        <input
          id="reg-university"
          name="university"
          autoComplete="organization"
          className="input"
          value={form.university}
          onChange={(event) => update('university')(event.target.value)}
          aria-invalid={Boolean(errors.university)}
        />
      </FormField>
      <FormField label={`${t('fieldPhone')} (${t('optional')})`} htmlFor="reg-phone" error={errors.phone && t(errors.phone)}>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          dir="ltr"
          className="input"
          value={form.phone}
          onChange={(event) => update('phone')(event.target.value)}
          aria-invalid={Boolean(errors.phone)}
        />
      </FormField>

      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? t('submitting') : isWaitlistOnly ? t('registerWaitlistButton') : t('registerButton')}
      </button>
    </form>
  );
}
