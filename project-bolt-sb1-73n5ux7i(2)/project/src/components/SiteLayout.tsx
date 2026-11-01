import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteLogo } from '@/components/SiteLogo';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useSiteLogo } from '@/lib/useSiteLogo';

export function SiteLayout({ path, children }: { path: string; children: ReactNode }) {
  const { t } = useLanguage();
  const logoUrl = useSiteLogo();
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-app text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-gold focus:px-4 focus:py-2 focus:text-on-gold"
      >
        {t('skipToContent')}
      </a>
      <SiteHeader path={path} logoUrl={logoUrl} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SiteLogo url={logoUrl} className="h-5 w-5" />
              <span className="font-bold text-gold">{t('brand')}</span>
            </div>
            <p className="max-w-sm text-muted">{t('footerTagline')}</p>
          </div>
          <nav aria-label={t('footerNav')} className="md:justify-self-end">
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
              <li><a className="inline-flex min-h-11 items-center hover:text-gold" href="#/">{t('navHome')}</a></li>
              <li><a className="inline-flex min-h-11 items-center hover:text-gold" href="#/membership">{t('navMembership')}</a></li>
              <li><a className="inline-flex min-h-11 items-center hover:text-gold" href="#/events">{t('navEvents')}</a></li>
              <li><a className="inline-flex min-h-11 items-center hover:text-gold" href="#/sponsors">{t('navSponsors')}</a></li>
              <li><a className="inline-flex min-h-11 items-center hover:text-gold" href="#/terms">{t('navLegal')}</a></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-border px-4 py-4 text-center text-sm text-muted sm:px-6">
          © {year} {t('brand')}. {t('footerRights')}
        </div>
      </footer>
    </div>
  );
}
