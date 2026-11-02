import { SiteLayout } from '@/components/SiteLayout';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import { useHashPath } from '@/lib/router';
import { PreferencesProvider } from '@/preferences/PreferencesProvider';
import { AdminPage } from '@/pages/AdminPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { EventsPage } from '@/pages/EventsPage';
import { HomePage } from '@/pages/HomePage';
import { LegalPage } from '@/pages/LegalPage';
import { MembershipPage } from '@/pages/MembershipPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SponsorsPage } from '@/pages/SponsorsPage';

const EVENT_DETAIL_PATTERN = /^\/events\/([^/]+)$/;

function Router({ path }: { path: string }) {
  const eventMatch = EVENT_DETAIL_PATTERN.exec(path);
  if (eventMatch) return <EventDetailPage eventId={eventMatch[1]} />;

  switch (path) {
    case '/':
      return <HomePage />;
    case '/membership':
      return <MembershipPage />;
    case '/events':
      return <EventsPage />;
    case '/sponsors':
      return <SponsorsPage />;
    case '/terms':
      return <LegalPage />;
    case '/admin':
      return <AdminPage />;
    default:
      return <NotFoundPage />;
  }
}

function AppShell() {
  const path = useHashPath();
  return (
    <SiteLayout path={path}>
      <Router path={path} />
    </SiteLayout>
  );
}

function App() {
  return (
    <PreferencesProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </PreferencesProvider>
  );
}

export default App;
