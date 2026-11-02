import { useState, type FormEvent } from 'react';
import { FormField, Notice } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { saveSponsor, type SponsorDraft } from '@/lib/admin/events';
import { isSafeHttpsUrl } from '@/lib/validation';
import type { Sponsor } from '@/types/club';

type Props = {
  sponsor: Sponsor | null;
  onClose: () => void;
  onSaved: () => void;
};

type Errors = Partial<Record<keyof SponsorDraft, TranslationKey>>;

function draftFrom(sponsor: Sponsor | null): SponsorDraft {
  return {
    name: sponsor?.name ?? '',
    descriptionEn: sponsor?.description_en ?? '',
    descriptionAr: sponsor?.description_ar ?? '',
    logoUrl: sponsor?.logo_url ?? '',
    websiteUrl: sponsor?.website_url ?? '',
    sortOrder: sponsor?.sort_order ?? 0,
    isActive: sponsor?.is_active ?? true,
  };
}

function validate(draft: SponsorDraft): Errors {
  const errors: Errors = {};
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 100) errors.name = 'invalidRequired';
  if (draft.descriptionEn.length > 1000) errors.descriptionEn = 'errTooLong';
  if (draft.descriptionAr.length > 1000) errors.descriptionAr = 'errTooLong';
  if (draft.logoUrl.trim() && !isSafeHttpsUrl(draft.logoUrl.trim())) errors.logoUrl = 'invalidUrl';
  if (draft.websiteUrl.trim() && !isSafeHttpsUrl(draft.websiteUrl.trim())) errors.websiteUrl = 'invalidUrl';
  if (!Number.isInteger(draft.sortOrder) || draft.sortOrder < 0 || draft.sortOrder > 999) {
    errors.sortOrder = 'invalidRequired';
  }
  return errors;
}

export function SponsorEditor({ sponsor, onClose, onSaved }: Props) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<SponsorDraft>(() => draftFrom(sponsor));
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState<TranslationKey | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SponsorDraft>(key: K, value: SponsorDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      await saveSponsor(draft, sponsor?.id ?? null);
      onSaved();
    } catch {
      setSaveError('adminActionError');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={t('partnerFormTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {saveError && <Notice tone="error">{t(saveError)}</Notice>}
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label={t('sponsorFieldName')} htmlFor="sponsor-name" required error={errors.name && t(errors.name)}>
            <input id="sponsor-name" className="input" value={draft.name} onChange={(e) => set('name', e.target.value)} aria-invalid={Boolean(errors.name)} />
          </FormField>
          <FormField label={t('sponsorFieldLogo')} htmlFor="sponsor-logo" error={errors.logoUrl && t(errors.logoUrl)}>
            <input id="sponsor-logo" dir="ltr" className="input" value={draft.logoUrl} onChange={(e) => set('logoUrl', e.target.value)} aria-invalid={Boolean(errors.logoUrl)} />
          </FormField>
          <FormField label={t('sponsorFieldWebsite')} htmlFor="sponsor-website" error={errors.websiteUrl && t(errors.websiteUrl)}>
            <input id="sponsor-website" dir="ltr" className="input" value={draft.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} aria-invalid={Boolean(errors.websiteUrl)} />
          </FormField>
          <FormField label={t('adminSortOrder')} htmlFor="sponsor-sort" error={errors.sortOrder && t(errors.sortOrder)}>
            <input id="sponsor-sort" inputMode="numeric" dir="ltr" className="input" value={draft.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} aria-invalid={Boolean(errors.sortOrder)} />
          </FormField>
        </div>
        <FormField label={t('sponsorFieldDescEn')} htmlFor="sponsor-desc-en" error={errors.descriptionEn && t(errors.descriptionEn)}>
          <textarea id="sponsor-desc-en" rows={3} className="input" value={draft.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />
        </FormField>
        <FormField label={t('sponsorFieldDescAr')} htmlFor="sponsor-desc-ar" error={errors.descriptionAr && t(errors.descriptionAr)}>
          <textarea id="sponsor-desc-ar" rows={3} className="input" value={draft.descriptionAr} onChange={(e) => set('descriptionAr', e.target.value)} />
        </FormField>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--c-gold))]" checked={draft.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          {t('sponsorFieldActive')}
        </label>
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('adminCancel')}</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('adminSaving') : t('adminSave')}</button>
        </div>
      </form>
    </Modal>
  );
}
