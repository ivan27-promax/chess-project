import { useState } from 'react';
import { CalendarDays, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { EventEditor } from '@/components/admin/EventEditor';
import { RegistrationsPanel } from '@/components/admin/RegistrationsPanel';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { deleteEvent, listAdminEvents } from '@/lib/admin/events';
import { EVENT_STATUS_KEYS } from '@/lib/labels';
import { formatDateTime } from '@/lib/events';
import { useAsyncData } from '@/lib/useAsyncData';
import type { ClubEvent } from '@/types/club';

type EditorState = { mode: 'create' } | { mode: 'edit'; event: ClubEvent } | null;

export function EventsPanel() {
  const { t, language } = useLanguage();
  const events = useAsyncData(listAdminEvents, []);
  const [editor, setEditor] = useState<EditorState>(null);
  const [manageEvent, setManageEvent] = useState<ClubEvent | null>(null);
  const [actionError, setActionError] = useState<TranslationKey | null>(null);

  if (manageEvent) {
    return <RegistrationsPanel event={manageEvent} onBack={() => setManageEvent(null)} />;
  }

  const handleDelete = async (event: ClubEvent) => {
    if (!window.confirm(t('confirmDeleteEvent'))) return;
    setActionError(null);
    try {
      await deleteEvent(event.id);
      events.reload();
    } catch {
      setActionError('deleteFailed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-muted">{t('eventsAdminIntro')}</p>
        <button type="button" className="btn-primary" onClick={() => setEditor({ mode: 'create' })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('actionNewEvent')}
        </button>
      </div>

      {actionError && <Notice tone="error">{t(actionError)}</Notice>}
      {events.error && (
        <Notice tone="error">
          <p>{t('loadError')}</p>
          <button type="button" onClick={events.reload} className="btn-ghost mt-2 px-0 text-danger">
            {t('retry')}
          </button>
        </Notice>
      )}
      {events.loading && !events.data && <p className="text-muted">{t('loading')}</p>}
      {events.data && events.data.length === 0 && <p className="text-muted">{t('noEvents')}</p>}

      {events.data && events.data.length > 0 && (
        <ul className="grid gap-4">
          {events.data.map((event) => (
            <li key={event.id} className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl">{event.title_en}</h2>
                  <span className="rounded-full border border-border px-3 py-0.5 text-xs font-semibold text-muted">
                    {t(EVENT_STATUS_KEYS[event.status])}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${
                      event.registration_open ? 'border-success text-success' : 'border-border text-muted'
                    }`}
                  >
                    {event.registration_open ? t('registrationOpenLabel') : t('registrationClosedLabel')}
                  </span>
                </div>
                <p className="flex items-center gap-2 text-sm text-muted">
                  <CalendarDays className="h-4 w-4 text-gold" aria-hidden="true" />
                  {formatDateTime(event.starts_at, language)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost min-h-10 px-3" onClick={() => setManageEvent(event)}>
                  <Users className="h-4 w-4" aria-hidden="true" />
                  {t('actionRegistrations')}
                  <span className="sr-only">: {event.title_en}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary min-h-10 px-3"
                  onClick={() => setEditor({ mode: 'edit', event })}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  {t('actionEdit')}
                  <span className="sr-only">: {event.title_en}</span>
                </button>
                <button type="button" className="btn-ghost min-h-10 px-3 text-danger" onClick={() => handleDelete(event)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {t('actionDelete')}
                  <span className="sr-only">: {event.title_en}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editor && (
        <EventEditor
          event={editor.mode === 'edit' ? editor.event : null}
          onClose={() => setEditor(null)}
          onSaved={() => {
            setEditor(null);
            events.reload();
          }}
        />
      )}
    </div>
  );
}
