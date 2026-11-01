import { useState } from 'react';
import { EventCard } from '@/components/EventCard';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { getEventState } from '@/lib/events';
import { usePublicEvents } from '@/lib/usePublicEvents';

type Filter = 'all' | 'upcoming' | 'past';

const FILTERS: { value: Filter; labelKey: TranslationKey }[] = [
  { value: 'all', labelKey: 'filterAll' },
  { value: 'upcoming', labelKey: 'filterUpcoming' },
  { value: 'past', labelKey: 'filterPast' },
];

export function EventsPage() {
  const { t } = useLanguage();
  const { data, loading, error, reload } = usePublicEvents();
  const [filter, setFilter] = useState<Filter>('all');

  const entries = (data?.events ?? []).map((event) => {
    const confirmedCount = data?.counts[event.id] ?? 0;
    return { event, confirmedCount, past: getEventState(event, confirmedCount) === 'past' };
  });

  const visible = entries
    .filter((entry) => filter === 'all' || (filter === 'past') === entry.past)
    .sort((a, b) => {
      const diff = new Date(a.event.starts_at).getTime() - new Date(b.event.starts_at).getTime();
      return filter === 'past' ? -diff : diff;
    });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">{t('navEvents')}</p>
      <h1 className="mt-3 text-4xl">{t('eventsTitle')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{t('eventsIntro')}</p>

      <div role="group" aria-label={t('filterLabel')} className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => setFilter(option.value)}
            className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors duration-200 ${
              filter === option.value
                ? 'border-gold bg-gold text-on-gold'
                : 'border-border bg-surface text-ink hover:border-gold'
            }`}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {loading && <p className="text-muted">{t('loading')}</p>}
        {error && (
          <Notice tone="error">
            <p>{t('loadError')}</p>
            <button type="button" onClick={reload} className="btn-ghost mt-2 px-0 text-danger">
              {t('retry')}
            </button>
          </Notice>
        )}
        {data && visible.length === 0 && <p className="text-muted">{t('emptyEvents')}</p>}
        {data && visible.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map(({ event, confirmedCount }) => (
              <EventCard key={event.id} event={event} confirmedCount={confirmedCount} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
