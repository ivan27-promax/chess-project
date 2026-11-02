import { useState, type FormEvent } from 'react';
import { FormField, Notice } from '@/components/FormField';
import { Modal } from '@/components/Modal';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { saveLink, type LinkDraft } from '@/lib/admin/events';
import { isSafeHttpsUrl } from '@/lib/validation';
import type { ExternalLink } from '@/types/club';

type Props = {
  link: ExternalLink | null;
  onClose: () => void;
  onSaved: () => void;
};

type Errors = Partial<Record<keyof LinkDraft, TranslationKey>>;

function draftFrom(link: ExternalLink | null): LinkDraft {
  return {
    labelEn: link?.label_en ?? '',
    labelAr: link?.label_ar ?? '',
    url: link?.url ?? '',
    sortOrder: link?.sort_order ?? 0,
    isActive: link?.is_active ?? true,
  };
}

function validate(draft: LinkDraft): Errors {
  const errors: Errors = {};
  const label = draft.labelEn.trim();
  if (label.length < 2 || label.length > 100) errors.labelEn = 'invalidRequired';
  if (draft.labelAr.length > 100) errors.labelAr = 'errTooLong';
  if (!isSafeHttpsUrl(draft.url.trim())) errors.url = 'invalidUrl';
  if (!Number.isInteger(draft.sortOrder) || draft.sortOrder < 0 || draft.sortOrder > 999) {
    errors.sortOrder = 'invalidRequired';
  }
  return errors;
}

export function LinkEditor({ link, onClose, onSaved }: Props) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<LinkDraft>(() => draftFrom(link));
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState<TranslationKey | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof LinkDraft>(key: K, value: LinkDraft[K]) => {
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
      await saveLink(draft, link?.id ?? null);
      onSaved();
    } catch {
      setSaveError('adminActionError');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={t('linkFormTitle')} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {saveError && <Notice tone="error">{t(saveError)}</Notice>}
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label={t('linkFieldLabelEn')} htmlFor="link-label-en" required error={errors.labelEn && t(errors.labelEn)}>
            <input id="link-label-en" className="input" value={draft.labelEn} onChange={(e) => set('labelEn', e.target.value)} aria-invalid={Boolean(errors.labelEn)} />
          </FormField>
          <FormField label={t('linkFieldLabelAr')} htmlFor="link-label-ar" error={errors.labelAr && t(errors.labelAr)}>
            <input id="link-label-ar" className="input" value={draft.labelAr} onChange={(e) => set('labelAr', e.target.value)} aria-invalid={Boolean(errors.labelAr)} />
          </FormField>
          <FormField label={t('linkFieldUrl')} htmlFor="link-url" required error={errors.url && t(errors.url)}>
            <input id="link-url" dir="ltr" className="input" value={draft.url} onChange={(e) => set('url', e.target.value)} aria-invalid={Boolean(errors.url)} />
          </FormField>
          <FormField label={t('adminSortOrder')} htmlFor="link-sort" error={errors.sortOrder && t(errors.sortOrder)}>
            <input id="link-sort" inputMode="numeric" dir="ltr" className="input" value={draft.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} aria-invalid={Boolean(errors.sortOrder)} />
          </FormField>
        </div>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--c-gold))]" checked={draft.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          {t('linkFieldActive')}
        </label>
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>{t('adminCancel')}</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('adminSaving') : t('adminSave')}</button>
        </div>
      </form>
    </Modal>
  );
}
