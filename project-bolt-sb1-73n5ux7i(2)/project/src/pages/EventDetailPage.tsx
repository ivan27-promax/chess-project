import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { EventRegistrationForm } from '@/components/EventRegistrationForm';
import { EventStateBadge } from '@/components/EventCard';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatDateTime, getEventState, seatsLeft } from '@/lib/events';
import { fetchEventById, fetchEventSeatCounts, fetchEventSponsors } from '@/lib/publicApi';
import { useAsyncData } from '@/lib/useAsyncData';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function EventDetailPage({ eventId }: { eventId: string }) {
  const { t, pick, language } = useLanguage();
  const isValidId = UUID_PATTERN.test(eventId);

  const detail = useAsyncData(async () => {
    if (!isValidId) return null;
    const [event, sponsors, counts] = await Promise.all([
      fetchEventById(eventId),
      fetchEventSponsors(eventId),
      fetchEventSeatCounts(),
    ]);
    if (!event) return null;
    return { event, sponsors, confirmedCount: counts[eventId] ?? 0 };
  }, [eventId]);

  const backLink = (
    <a href="#/events" className="btn-ghost px-0">
      <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      {t('backToEvents')}
    </a>
  );

  if (detail.loading && !detail.data) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-muted">{t('loading')}</p>
      </section>
    );
  }

  if (detail.error) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6">
        {backLink}
        <Notice tone="error">
          <p>{t('loadError')}</p>
          <button type="button" onClick={detail.reload} className="btn-ghost mt-2 px-0 text-danger">
            {t('retry')}
          </button>
        </Notice>
      </section>
    );
  }

  if (!detail.data) {
    return (
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6">
        {backLink}
        <h1 className="text-3xl">{t('eventNotFoundTitle')}</h1>
        <p className="text-muted">{t('eventNotFoundBody')}</p>
      </section>
    );
  }

  const { event, sponsors, confirmedCount } = detail.data;
  const state = getEventState(event, confirmedCount);
  const title = pick(event.title_en, event.title_ar);
  const description = pick(event.description_en, event.description_ar);
  const location = pick(event.location_en, event.location_ar);
  const seats = seatsLeft(event, confirmedCount);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {backLink}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <article className="space-y-8">
          <div className="space-y-4">
            <EventStateBadge state={state} seats={seats} />
            <h1 className="text-4xl">{title}</h1>
            <ul className="space-y-3 text-lg text-muted">
              <li className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                <span>{formatDateTime(event.starts_at, language)}</span>
              </li>
              {location && (
                <li className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span>{location}</span>
                </li>
              )}
            </ul>
          </div>

          {description && <p className="whitespace-pre-line text-lg leading-relaxed text-muted">{description}</p>}

          {sponsors.length > 0 && (
            <div className="space-y-4 border-t border-border pt-8">
              <h2 className="text-2xl">{t('eventSponsorsTitle')}</h2>
              <ul className="flex flex-wrap gap-3">
                {sponsors.map((sponsor) => (
                  <li key={sponsor.id} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium">
                    {sponsor.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        <aside className="card space-y-6 lg:sticky lg:top-28">
          <div className="space-y-2">
            <h2 className="text-2xl">{t('registerTitle')}</h2>
            <p className="text-sm text-muted">{t('registerIntro')}</p>
          </div>
          <EventRegistrationForm
            key={event.id}
            eventId={event.id}
            state={state}
            onRegistered={detail.reload}
          />
        </aside>
      </div>
    </section>
  );
}
