import { ArrowRight, Shield, Trophy, Users } from 'lucide-react';
import { EventCard } from '@/components/EventCard';
import { useLanguage } from '@/i18n/LanguageProvider';
import { fetchActiveLinks, fetchSiteContent } from '@/lib/publicApi';
import { useAsyncData } from '@/lib/useAsyncData';
import { usePublicEvents } from '@/lib/usePublicEvents';
import { Notice } from '@/components/FormField';

const HERO_IMAGE =
  'https://images.pexels.com/photos/136352/pexels-photo-136352.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export function HomePage() {
  const { t, pick } = useLanguage();
  const content = useAsyncData(fetchSiteContent, []);
  const events = usePublicEvents();
  const links = useAsyncData(fetchActiveLinks, []);

  const getText = (key: string): string => {
    const entry = content.data?.find((item) => item.key === key);
    return entry ? pick(entry.value_en, entry.value_ar) : '';
  };

  const upcoming = (events.data?.events ?? [])
    .filter((event) => new Date(event.ends_at ?? event.starts_at).getTime() >= Date.now())
    .slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt={t('heroImageAlt')}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          width={940}
          height={650}
          fetchPriority="high"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black" aria-hidden="true" />
        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-6 px-4 py-20 sm:px-6">
          <p className="eyebrow">{t('heroEyebrow')}</p>
          <h1 className="max-w-3xl text-4xl text-white sm:text-6xl">{getText('hero_title') || t('brand')}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-white/90">{getText('hero_subtitle')}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="#/membership" className="btn-primary">
              {t('heroCtaJoin')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </a>
            <a href="#/events" className="btn-secondary border-white/40 bg-black/40 text-white hover:border-gold hover:text-gold">
              {t('heroCtaEvents')}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
          <div className="space-y-4">
            <p className="eyebrow">{t('brand')}</p>
            <h2 className="text-3xl sm:text-4xl">{t('aboutTitle')}</h2>
          </div>
          <p className="text-lg leading-relaxed text-muted">{getText('about_body')}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Users, title: t('cardJoinTitle'), body: t('cardJoinBody'), href: '#/membership' },
            { icon: Trophy, title: t('cardEventsTitle'), body: t('cardEventsBody'), href: '#/events' },
            { icon: Shield, title: t('cardSponsorsTitle'), body: t('cardSponsorsBody'), href: '#/sponsors' },
          ].map(({ icon: Icon, title, body, href }) => (
            <a key={href} href={href} className="card group flex flex-col gap-4 hover:-translate-y-1 hover:border-gold">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold">
                <Icon className="h-6 w-6 text-gold" aria-hidden="true" />
              </span>
              <h3 className="text-xl">{title}</h3>
              <p className="text-muted">{body}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">{t('navEvents')}</p>
              <h2 className="text-3xl">{t('eventsPreviewTitle')}</h2>
            </div>
            <a href="#/events" className="btn-ghost">
              {t('eventsViewAll')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </a>
          </div>

          {events.loading && <p className="text-muted">{t('loading')}</p>}
          {events.error && (
            <Notice tone="error">
              <p>{t('loadError')}</p>
              <button type="button" onClick={events.reload} className="btn-ghost mt-2 px-0 text-danger">
                {t('retry')}
              </button>
            </Notice>
          )}
          {events.data && upcoming.length === 0 && <p className="text-muted">{t('emptyEvents')}</p>}
          {events.data && upcoming.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} confirmedCount={events.data?.counts[event.id] ?? 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl">{t('linksTitle')}</h2>
        <p className="mt-3 max-w-2xl text-muted">{t('linksIntro')}</p>
        {links.loading && <p className="mt-6 text-muted">{t('loading')}</p>}
        {links.data && links.data.length === 0 && <p className="mt-6 text-muted">{t('emptyLinks')}</p>}
        {links.data && links.data.length > 0 && (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.data.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card flex min-h-11 items-center justify-between gap-3 hover:border-gold hover:text-gold"
                >
                  <span className="font-medium">{pick(link.label_en, link.label_ar)}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
                  <span className="sr-only">({t('sponsorVisit')})</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
