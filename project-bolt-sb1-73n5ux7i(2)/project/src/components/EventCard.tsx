import { CalendarDays, MapPin } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatDateTime, getEventState, seatsLeft, type EventState } from '@/lib/events';
import type { ClubEvent } from '@/types/club';

const BADGE_STYLES: Record<EventState, string> = {
  open: 'border-success text-success',
  full: 'border-warning text-warning',
  closed: 'border-border text-muted',
  past: 'border-border text-muted',
};

export function EventStateBadge({ state, seats }: { state: EventState; seats: number | null }) {
  const { t } = useLanguage();
  const label =
    state === 'open'
      ? seats === null
        ? t('eventUnlimited')
        : t('eventSeatsLeft', { n: seats })
      : state === 'full'
        ? t('eventFull')
        : state === 'closed'
          ? t('eventClosed')
          : t('eventPast');

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${BADGE_STYLES[state]}`}>
      {label}
    </span>
  );
}

export function EventCard({ event, confirmedCount }: { event: ClubEvent; confirmedCount: number }) {
  const { t, pick, language } = useLanguage();
  const state = getEventState(event, confirmedCount);
  const title = pick(event.title_en, event.title_ar);
  const location = pick(event.location_en, event.location_ar);

  return (
    <article className="card group flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-1 hover:border-gold">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl">{title}</h3>
        <EventStateBadge state={state} seats={seatsLeft(event, confirmedCount)} />
      </div>
      <ul className="space-y-2 text-muted">
        <li className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
          <span>{formatDateTime(event.starts_at, language)}</span>
        </li>
        {location && (
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            <span>{location}</span>
          </li>
        )}
      </ul>
      <a href={`#/events/${event.id}`} className="btn-secondary mt-auto w-full sm:w-auto sm:self-start">
        {t('open')}
        <span className="sr-only">: {title}</span>
      </a>
    </article>
  );
}
