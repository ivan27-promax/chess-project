import { useState } from 'react';
import { Globe, Menu, X } from 'lucide-react';
import { AccessibilityMenu } from '@/components/AccessibilityMenu';
import { SiteLogo } from '@/components/SiteLogo';
import { useLanguage } from '@/i18n/LanguageProvider';

type NavItem = { href: string; label: string; match: string };

export function SiteHeader({ path, logoUrl }: { path: string; logoUrl: string | null }) {
  const { t, language, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const items: NavItem[] = [
    { href: '#/', label: t('navHome'), match: '/' },
    { href: '#/membership', label: t('navMembership'), match: '/membership' },
    { href: '#/events', label: t('navEvents'), match: '/events' },
    { href: '#/sponsors', label: t('navSponsors'), match: '/sponsors' },
  ];

  const isActive = (item: NavItem) =>
    item.match === '/' ? path === '/' : path === item.match || path.startsWith(`${item.match}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-app/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#/" className="flex items-center gap-3 rounded-md" aria-label={`${t('brand')} ${t('brandTagline')}`}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold bg-surface">
            <SiteLogo url={logoUrl} className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-wide text-gold">{t('brand')}</span>
            <span className="block text-xs text-muted">{t('brandTagline')}</span>
          </span>
        </a>

        <nav aria-label={t('mainMenu')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={isActive(item) ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-md px-3 font-medium transition-colors hover:text-gold ${
                    isActive(item) ? 'text-gold' : 'text-ink'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="btn-secondary min-h-11 px-3"
            aria-label={language === 'en' ? 'Switch language to Arabic' : 'التبديل إلى الإنجليزية'}
          >
            <Globe className="h-5 w-5" aria-hidden="true" />
            <span>{t('switchLanguage')}</span>
          </button>
          <AccessibilityMenu />
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
            className="btn-secondary min-h-11 min-w-11 px-3 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label={t('mainMenu')} className="border-t border-border md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(item) ? 'page' : undefined}
                  className={`flex min-h-11 items-center rounded-md px-3 font-medium hover:text-gold ${
                    isActive(item) ? 'text-gold' : 'text-ink'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
