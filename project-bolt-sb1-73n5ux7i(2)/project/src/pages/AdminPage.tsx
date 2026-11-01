import { useCallback, useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { AccountPanel } from '@/components/admin/AccountPanel';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { ContentPanel } from '@/components/admin/ContentPanel';
import { EventsPanel } from '@/components/admin/EventsPanel';
import { MembershipsPanel } from '@/components/admin/MembershipsPanel';
import { PartnersPanel } from '@/components/admin/PartnersPanel';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { getCurrentSession, isCurrentUserAdmin, signOutAdmin } from '@/lib/admin/auth';

type Gate = 'checking' | 'signed-out' | 'denied' | 'admin';
type Tab = 'memberships' | 'events' | 'partners' | 'content' | 'account';

const TABS: { id: Tab; labelKey: TranslationKey }[] = [
  { id: 'memberships', labelKey: 'adminTabRequests' },
  { id: 'events', labelKey: 'adminTabEvents' },
  { id: 'partners', labelKey: 'adminTabSponsors' },
  { id: 'content', labelKey: 'adminTabContent' },
  { id: 'account', labelKey: 'adminTabAccount' },
];

export function AdminPage() {
  const { t } = useLanguage();
  const [gate, setGate] = useState<Gate>('checking');
  const [tab, setTab] = useState<Tab>('memberships');

  const verifyAccess = useCallback(async () => {
    setGate('checking');
    try {
      const session = await getCurrentSession();
      if (!session) {
        setGate('signed-out');
        return;
      }
      if (!(await isCurrentUserAdmin())) {
        await signOutAdmin();
        setGate('denied');
        return;
      }
      setGate('admin');
    } catch {
      setGate('signed-out');
    }
  }, []);

  useEffect(() => {
    void verifyAccess();
  }, [verifyAccess]);

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
    } finally {
      setGate('signed-out');
    }
  };

  if (gate === 'checking') {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-muted">{t('adminChecking')}</p>
      </section>
    );
  }

  if (gate === 'signed-out' || gate === 'denied') {
    return (
      <>
        {gate === 'denied' && (
          <div className="mx-auto max-w-md px-4 pt-12 sm:px-6">
            <Notice tone="error">{t('adminNotAuthorized')}</Notice>
          </div>
        )}
        <AdminLogin onSignedIn={verifyAccess} />
      </>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl">{t('adminTitle')}</h1>
        <button type="button" onClick={handleSignOut} className="btn-secondary">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('adminLogout')}
        </button>
      </div>

      <div role="tablist" aria-label={t('adminTitle')} className="mt-8 flex gap-2 overflow-x-auto border-b border-border pb-px">
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors duration-200 ${
              tab === item.id ? 'border-gold text-gold' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-8">
        {tab === 'memberships' && <MembershipsPanel />}
        {tab === 'events' && <EventsPanel />}
        {tab === 'partners' && <PartnersPanel />}
        {tab === 'content' && <ContentPanel />}
        {tab === 'account' && <AccountPanel />}
      </div>
    </section>
  );
}
