import { useState, type FormEvent } from 'react';
import { FormField, Notice } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import {
  listAdminSponsors,
  listEventSponsorIds,
  saveEvent,
  setEventSponsorIds,
  type EventDraft,
} from '@/lib/admin/events';
import { useAsyncData } from '@/lib/useAsyncData';
import type { ClubEvent, EventStatus, Sponsor } from '@/types/club';

type Props = {
  event: ClubEvent | null;
  onClose: () => void;
  onSaved: () => void;
};

const MAX_TEXT = 3000;

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function emptyDraft(): EventDraft {
  return {
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    locationEn: '',
    locationAr: '',
    startsAt: '',
    endsAt: '',
    capacity: '',
    status: 'draft',
    registrationOpen: false,
  };
}

function draftFrom(event: ClubEvent): EventDraft {
  return {
    titleEn: event.title_en,
    titleAr: event.title_ar ?? '',
    descriptionEn: event.description_en ?? '',
    descriptionAr: event.description_ar ?? '',
    locationEn: event.location_en ?? '',
    locationAr: event.location_ar ?? '',
    startsAt: toLocalInput(event.starts_at),
    endsAt: toLocalInput(event.ends_at),
    capacity: event.capacity?.toString() ?? '',
    status: event.status,
    registrationOpen: event.registration_open,
  };
}

function validateDraft(draft: EventDraft): Partial<Record<keyof EventDraft, TranslationKey>> {
  const errors: Partial<Record<keyof EventDraft, TranslationKey>> = {};
  const title = draft.titleEn.trim();
  if (title.length < 2 || title.length > 150) errors.titleEn = 'eventErrTitle';
  if (draft.titleAr.length > 150) errors.titleAr = 'eventErrTitle';
  if (draft.descriptionEn.length > MAX_TEXT) errors.descriptionEn = 'errTooLong';
  if (draft.descriptionAr.length > MAX_TEXT) errors.descriptionAr = 'errTooLong';
  if (draft.locationEn.length > 200) errors.locationEn = 'errTooLong';
  if (draft.locationAr.length > 200) errors.locationAr = 'errTooLong';

  const starts = new Date(draft.startsAt).getTime();
  if (!draft.startsAt || Number.isNaN(starts)) errors.startsAt = 'eventErrStart';
  if (draft.endsAt) {
    const ends = new Date(draft.endsAt).getTime();
    if (Number.isNaN(ends) || (!Number.isNaN(starts) && ends < starts)) errors.endsAt = 'eventErrEnd';
  }

  const capacity = draft.capacity.trim();
  if (capacity && !(/^\d+$/.test(capacity) && Number(capacity) >= 1 && Number(capacity) <= 10000)) {
    errors.capacity = 'eventErrCapacity';
  }
  return errors;
}

export function EventEditor({ event, onClose, onSaved }: Props) {
  const { t } = useLanguage();
  const editing = useAsyncData(
    async () => {
      const [sponsors, sponsorIds] = await Promise.all([
        listAdminSponsors(),
        event ? listEventSponsorIds(event.id) : Promise.resolve<string[]>([]),
      ]);
      return { sponsors, sponsorIds };
    },
    [event?.id],
  );

  return (
    <Modal title={t(event ? 'eventsAdminEdit' : 'eventsAdminNew')} onClose={onClose}>
      {editing.loading && !editing.data && <p className="text-muted">{t('loading')}</p>}
      {editing.error && (
        <Notice tone="error">
          <p>{t('loadError')}</p>
          <button type="button" onClick={editing.reload} className="btn-ghost mt-2 px-0 text-danger">
            {t('retry')}
          </button>
        </Notice>
      )}
      {editing.data && (
        <EventForm
          initialDraft={event ? draftFrom(event) : emptyDraft()}
          initialEventId={event?.id ?? null}
          initialSponsorIds={editing.data.sponsorIds}
          sponsors={editing.data.sponsors}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Modal>
  );
}

function EventForm({
  initialDraft,
  initialEventId,
  initialSponsorIds,
  sponsors,
  onClose,
  onSaved,
}: {
  initialDraft: EventDraft;
  initialEventId: string | null;
  initialSponsorIds: string[];
  sponsors: Sponsor[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<EventDraft>(initialDraft);
  const [sponsorIds, setSponsorIds] = useState<string[]>(initialSponsorIds);
  const [eventId, setEventId] = useState<string | null>(initialEventId);
  const [errors, setErrors] = useState<Partial<Record<keyof EventDraft, TranslationKey>>>({});
  const [saveError, setSaveError] = useState<TranslationKey | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleSponsor = (id: string) => {
    setSponsorIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      const savedId = await saveEvent(draft, eventId);
      setEventId(savedId);
      await setEventSponsorIds(savedId, sponsorIds);
      onSaved();
    } catch {
      setSaveError(eventId ? 'adminActionError' : 'eventSaveError');
    } finally {
      setSaving(false);
    }
  };

  const textField = (
    key: 'titleEn' | 'titleAr' | 'descriptionEn' | 'descriptionAr' | 'locationEn' | 'locationAr',
    labelKey: TranslationKey,
    multiline = false,
    required = false,
  ) => (
    <FormField label={t(labelKey)} htmlFor={`event-${key}`} required={required} error={errors[key] && t(errors[key])}>
      {multiline ? (
        <textarea
          id={`event-${key}`}
          rows={4}
          className="input"
          value={draft[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={Boolean(errors[key])}
        />
      ) : (
        <input
          id={`event-${key}`}
          className="input"
          value={draft[key]}
          onChange={(e) => set(key, e.target.value)}
          aria-invalid={Boolean(errors[key])}
        />
      )}
    </FormField>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {saveError && <Notice tone="error">{t(saveError)}</Notice>}

      <div className="grid gap-6 sm:grid-cols-2">
        {textField('titleEn', 'eventFieldTitleEn', false, true)}
        {textField('titleAr', 'eventFieldTitleAr')}
        {textField('locationEn', 'eventFieldLocEn')}
        {textField('locationAr', 'eventFieldLocAr')}
        <FormField label={t('eventFieldStarts')} htmlFor="event-startsAt" required error={errors.startsAt && t(errors.startsAt)}>
          <input
            id="event-startsAt"
            type="datetime-local"
            className="input"
            value={draft.startsAt}
            onChange={(e) => set('startsAt', e.target.value)}
            aria-invalid={Boolean(errors.startsAt)}
          />
        </FormField>
        <FormField label={t('eventFieldEnds')} htmlFor="event-endsAt" error={errors.endsAt && t(errors.endsAt)}>
          <input
            id="event-endsAt"
            type="datetime-local"
            className="input"
            value={draft.endsAt}
            onChange={(e) => set('endsAt', e.target.value)}
            aria-invalid={Boolean(errors.endsAt)}
          />
        </FormField>
        <FormField label={t('eventFieldCapacity')} htmlFor="event-capacity" error={errors.capacity && t(errors.capacity)}>
          <input
            id="event-capacity"
            inputMode="numeric"
            dir="ltr"
            className="input"
            value={draft.capacity}
            onChange={(e) => set('capacity', e.target.value)}
            aria-invalid={Boolean(errors.capacity)}
          />
        </FormField>
        <FormField label={t('eventFieldStatus')} htmlFor="event-status">
          <select id="event-status" className="input" value={draft.status} onChange={(e) => set('status', e.target.value as EventStatus)}>
            <option value="draft">{t('eventStatusDraft')}</option>
            <option value="published">{t('eventStatusPublished')}</option>
            <option value="archived">{t('eventStatusArchived')}</option>
          </select>
        </FormField>
      </div>

      {textField('descriptionEn', 'eventFieldDescEn', true)}
      {textField('descriptionAr', 'eventFieldDescAr', true)}

      <label className="flex min-h-11 items-center gap-3 text-ink">
        <input
          type="checkbox"
          className="h-5 w-5 accent-[rgb(var(--c-gold))]"
          checked={draft.registrationOpen}
          onChange={(e) => set('registrationOpen', e.target.checked)}
        />
        {t('eventFieldRegOpen')}
      </label>

      <fieldset className="space-y-3">
        <legend className="field-label">{t('eventSponsorsLabel')}</legend>
        {sponsors.length === 0 && <p className="text-sm text-muted">{t('sponsorsAdminNone')}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {sponsors.map((sponsor) => (
            <label key={sponsor.id} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[rgb(var(--c-gold))]"
                checked={sponsorIds.includes(sponsor.id)}
                onChange={() => toggleSponsor(sponsor.id)}
              />
              {sponsor.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onClose}>
          {t('adminCancel')}
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t('adminSaving') : t('adminSave')}
        </button>
      </div>
    </form>
  );
}
