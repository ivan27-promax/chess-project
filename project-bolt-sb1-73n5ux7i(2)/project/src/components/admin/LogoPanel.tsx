import { useState, type FormEvent } from 'react';
import { SiteLogo } from '@/components/SiteLogo';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { saveSiteContent } from '@/lib/admin/content';
import { SITE_LOGO_KEY } from '@/lib/useSiteLogo';
import { isSafeHttpsUrl } from '@/lib/validation';

export function LogoPanel({ savedUrl, onSaved }: { savedUrl: string; onSaved: () => void }) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(savedUrl);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [saving, setSaving] = useState(false);
  const previewUrl = savedUrl && isSafeHttpsUrl(savedUrl) ? savedUrl : null;

  const save = async (value: string) => {
    setError(null);
    setSaving(true);
    try {
      await saveSiteContent(SITE_LOGO_KEY, value, '');
      onSaved();
    } catch {
      setError('adminActionError');
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = draft.trim();
    if (value && !isSafeHttpsUrl(value)) {
      setError('siteLogoInvalid');
      return;
    }
    void save(value);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl">{t('siteLogoTitle')}</h2>
        <p className="text-muted">{t('siteLogoIntro')}</p>
      </div>
      {error && <Notice tone="error">{t(error)}</Notice>}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-border bg-surface">
            <SiteLogo url={previewUrl} className="h-16 w-16" />
          </div>
          <span className="text-xs text-muted">{previewUrl ? t('siteLogoPreview') : t('siteLogoDefault')}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor="site-logo-url" className="field-label">
            {t('sponsorFieldLogo')}
          </label>
          <input
            id="site-logo-url"
            type="url"
            dir="ltr"
            placeholder="https://"
            className="input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {savedUrl && (
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => { setDraft(''); void save(''); }}>
            {t('siteLogoReset')}
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t('adminSaving') : t('adminSave')}
        </button>
      </div>
    </form>
  );
}
