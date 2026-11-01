import { useEffect, useState, type FormEvent } from 'react';
import { LogoPanel } from '@/components/admin/LogoPanel';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { saveSiteContent } from '@/lib/admin/content';
import { fetchSiteContent } from '@/lib/publicApi';
import { useAsyncData } from '@/lib/useAsyncData';
import { SITE_LOGO_KEY } from '@/lib/useSiteLogo';

const FIELDS: { key: string; labelKey: TranslationKey; max: number; multiline: boolean }[] = [
  { key: 'hero_title', labelKey: 'contentHeroTitle', max: 150, multiline: false },
  { key: 'hero_subtitle', labelKey: 'contentHeroSubtitle', max: 400, multiline: true },
  { key: 'about_body', labelKey: 'contentAbout', max: 3000, multiline: true },
];

type Draft = { en: string; ar: string };

export function ContentPanel() {
  const { t } = useLanguage();
  const content = useAsyncData(fetchSiteContent, []);
  const logoValue = content.data?.find((item) => item.key === SITE_LOGO_KEY)?.value_en ?? '';

  return (
    <div className="space-y-8">
      <p className="text-muted">{t('contentSaveHint')}</p>
      {content.error && (
        <Notice tone="error">
          <p>{t('loadError')}</p>
          <button type="button" onClick={content.reload} className="btn-ghost mt-2 px-0 text-danger">
            {t('retry')}
          </button>
        </Notice>
      )}
      {content.data &&
        FIELDS.map((field) => {
          const entry = content.data?.find((item) => item.key === field.key);
          return (
            <ContentField
              key={`${field.key}-${entry?.value_en ?? ''}-${entry?.value_ar ?? ''}`}
              field={field}
              initial={{ en: entry?.value_en ?? '', ar: entry?.value_ar ?? '' }}
              onSaved={content.reload}
            />
          );
        })}
      {content.data && <LogoPanel key={logoValue} savedUrl={logoValue} onSaved={content.reload} />}
    </div>
  );
}

function ContentField({
  field,
  initial,
  onSaved,
}: {
  field: (typeof FIELDS)[number];
  initial: Draft;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 3000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const en = draft.en.trim();
    const ar = draft.ar.trim();
    if (!en) {
      setError('invalidRequired');
      return;
    }
    if (en.length > field.max || ar.length > field.max * 2) {
      setError('errTooLong');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveSiteContent(field.key, en, ar);
      setSaved(true);
      onSaved();
    } catch {
      setError('adminActionError');
    } finally {
      setSaving(false);
    }
  };

  const Input = field.multiline ? 'textarea' : 'input';

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-6">
      <h2 className="text-xl">{t(field.labelKey)}</h2>
      {error && <Notice tone="error">{t(error)}</Notice>}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${field.key}-en`} className="field-label">
            {t('contentEnglish')}
          </label>
          <Input
            id={`${field.key}-en`}
            className="input"
            rows={field.multiline ? 4 : undefined}
            value={draft.en}
            onChange={(e) => setDraft((current) => ({ ...current, en: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`${field.key}-ar`} className="field-label">
            {t('contentArabic')}
          </label>
          <Input
            id={`${field.key}-ar`}
            dir="rtl"
            className="input"
            rows={field.multiline ? 4 : undefined}
            value={draft.ar}
            onChange={(e) => setDraft((current) => ({ ...current, ar: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        {saved && <span role="status" className="text-sm font-semibold text-success">{t('adminSaved')}</span>}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t('adminSaving') : t('adminSave')}
        </button>
      </div>
    </form>
  );
}
