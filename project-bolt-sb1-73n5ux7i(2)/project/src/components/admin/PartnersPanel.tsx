import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { LinkEditor } from '@/components/admin/LinkEditor';
import { SponsorEditor } from '@/components/admin/SponsorEditor';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { deleteLink, deleteSponsor, listAdminLinks, listAdminSponsors } from '@/lib/admin/events';
import { useAsyncData } from '@/lib/useAsyncData';
import type { ExternalLink, Sponsor } from '@/types/club';

type Editor =
  | { kind: 'sponsor'; sponsor: Sponsor | null }
  | { kind: 'link'; link: ExternalLink | null }
  | null;

export function PartnersPanel() {
  const { t } = useLanguage();
  const sponsors = useAsyncData(listAdminSponsors, []);
  const links = useAsyncData(listAdminLinks, []);
  const [editor, setEditor] = useState<Editor>(null);
  const [actionError, setActionError] = useState<TranslationKey | null>(null);

  const remove = async (action: () => Promise<void>, reload: () => void) => {
    if (!window.confirm(t('adminDeleteConfirm'))) return;
    setActionError(null);
    try {
      await action();
      reload();
    } catch {
      setActionError('adminActionError');
    }
  };

  return (
    <div className="space-y-12">
      {actionError && <Notice tone="error">{t(actionError)}</Notice>}

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl">{t('navSponsors')}</h2>
          <button type="button" className="btn-primary" onClick={() => setEditor({ kind: 'sponsor', sponsor: null })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('sponsorsAdminAdd')}
          </button>
        </div>
        {sponsors.error && <Notice tone="error">{t('loadError')}</Notice>}
        {sponsors.data && sponsors.data.length === 0 && <p className="text-muted">{t('sponsorsAdminNone')}</p>}
        <ul className="grid gap-4">
          {(sponsors.data ?? []).map((sponsor) => (
            <li key={sponsor.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{sponsor.name}</p>
                <p className="text-sm text-muted">{sponsor.is_active ? t('sponsorFieldActive') : t('statusCancelled')}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary min-h-10 px-3" onClick={() => setEditor({ kind: 'sponsor', sponsor })}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {t('adminEdit')}
                  <span className="sr-only">: {sponsor.name}</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost min-h-10 px-3 text-danger"
                  onClick={() => remove(() => deleteSponsor(sponsor.id), sponsors.reload)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {t('adminDelete')}
                  <span className="sr-only">: {sponsor.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl">{t('linksTitle')}</h2>
          <button type="button" className="btn-primary" onClick={() => setEditor({ kind: 'link', link: null })}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('linksAdminAdd')}
          </button>
        </div>
        {links.error && <Notice tone="error">{t('loadError')}</Notice>}
        {links.data && links.data.length === 0 && <p className="text-muted">{t('linksAdminNone')}</p>}
        <ul className="grid gap-4">
          {(links.data ?? []).map((link) => (
            <li key={link.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{link.label_en}</p>
                <p dir="ltr" className="break-all text-sm text-muted">{link.url}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary min-h-10 px-3" onClick={() => setEditor({ kind: 'link', link })}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {t('adminEdit')}
                  <span className="sr-only">: {link.label_en}</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost min-h-10 px-3 text-danger"
                  onClick={() => remove(() => deleteLink(link.id), links.reload)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {t('adminDelete')}
                  <span className="sr-only">: {link.label_en}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {editor?.kind === 'sponsor' && (
        <SponsorEditor
          sponsor={editor.sponsor}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            sponsors.reload();
          }}
        />
      )}
      {editor?.kind === 'link' && (
        <LinkEditor
          link={editor.link}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            links.reload();
          }}
        />
      )}
    </div>
  );
}
