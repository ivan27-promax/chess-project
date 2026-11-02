import { useState, type FormEvent } from 'react';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import { AdminPager } from '@/components/admin/AdminPager';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import {
  countConfirmedRegistrations,
  deleteRegistration,
  exportRegistrations,
  listRegistrations,
  updateRegistrationStatus,
} from '@/lib/admin/members';
import { buildCsv, downloadCsv } from '@/lib/csv';
import { REGISTRATION_STATUS_KEYS } from '@/lib/labels';
import { useAsyncData } from '@/lib/useAsyncData';
import type { ClubEvent, EventRegistration, RegistrationStatus } from '@/types/club';

const STATUSES: RegistrationStatus[] = ['confirmed', 'waitlisted', 'cancelled'];

export function RegistrationsPanel({ event, onBack }: { event: ClubEvent; onBack: () => void }) {
  const { t, language } = useLanguage();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [status, setStatus] = useState<'all' | RegistrationStatus>('all');
  const [actionError, setActionError] = useState<TranslationKey | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const list = useAsyncData(
    () => listRegistrations({ eventId: event.id, page, search, status }),
    [event.id, page, search, status],
  );
  const confirmed = useAsyncData(() => countConfirmedRegistrations(event.id), [event.id]);

  const refresh = () => {
    list.reload();
    confirmed.reload();
  };

  const handleSearch = (submit: FormEvent<HTMLFormElement>) => {
    submit.preventDefault();
    setPage(0);
    setSearch(draftSearch);
  };

  const handleStatusChange = async (row: EventRegistration, next: RegistrationStatus) => {
    setBusyId(row.id);
    setActionError(null);
    try {
      await updateRegistrationStatus(row.id, next);
      refresh();
    } catch {
      setActionError('adminActionError');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: EventRegistration) => {
    if (!window.confirm(t('adminDeleteConfirm'))) return;
    setBusyId(row.id);
    setActionError(null);
    try {
      await deleteRegistration(row.id);
      refresh();
    } catch {
      setActionError('adminActionError');
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setActionError(null);
    try {
      const rows = await exportRegistrations(event.id);
      const csv = buildCsv(rows, [
        { header: t('colName'), value: (row) => row.full_name },
        { header: t('colEmail'), value: (row) => row.email },
        { header: t('colUniversity'), value: (row) => row.university },
        { header: t('colPhone'), value: (row) => row.phone },
        { header: t('colStatus'), value: (row) => t(REGISTRATION_STATUS_KEYS[row.status]) },
        { header: t('colDate'), value: (row) => row.created_at },
      ]);
      const slug = event.title_en.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40) || 'event';
      downloadCsv(`8squared-${slug}-registrations.csv`, csv);
    } catch {
      setActionError('adminActionError');
    } finally {
      setExporting(false);
    }
  };

  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="btn-ghost px-0">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {t('eventsAdminBackToList')}
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="eyebrow">{t('eventsAdminRegistrations')}</p>
          <h2 className="text-2xl">{event.title_en}</h2>
          <p className="text-muted">
            {confirmed.data !== null && event.capacity !== null
              ? `${confirmed.data} / ${event.capacity} ${t('statusConfirmed')}`
              : confirmed.data !== null
                ? `${confirmed.data} ${t('statusConfirmed')}`
                : ''}
          </p>
        </div>
        <button type="button" onClick={handleExport} disabled={exporting} className="btn-primary">
          <Download className="h-4 w-4" aria-hidden="true" />
          {exporting ? t('adminExporting') : t('adminExportCsv')}
        </button>
      </div>

      <form onSubmit={handleSearch} role="search" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label htmlFor="registration-search" className="field-label">
            {t('adminSearch')}
          </label>
          <input
            id="registration-search"
            type="search"
            className="input"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="registration-status" className="field-label">
            {t('adminFilterStatus')}
          </label>
          <select
            id="registration-status"
            className="input"
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as 'all' | RegistrationStatus);
            }}
          >
            <option value="all">{t('filterAllStatuses')}</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {t(REGISTRATION_STATUS_KEYS[value])}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary">
          {t('adminSearchButton')}
        </button>
      </form>

      {actionError && <Notice tone="error">{t(actionError)}</Notice>}
      {list.error && (
        <Notice tone="error">
          <p>{t('loadError')}</p>
          <button type="button" onClick={list.reload} className="btn-ghost mt-2 px-0 text-danger">
            {t('retry')}
          </button>
        </Notice>
      )}
      {list.loading && !list.data && <p className="text-muted">{t('loading')}</p>}
      {list.data && rows.length === 0 && <p className="text-muted">{t('adminNoRows')}</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('colName')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('colUniversity')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('colPhone')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('colStatus')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('colDate')}</th>
                <th scope="col" className="px-4 py-3 text-end font-semibold">{t('adminActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{row.full_name}</div>
                    <div dir="ltr" className="text-muted">{row.email}</div>
                  </td>
                  <td className="px-4 py-3">{row.university}</td>
                  <td dir="ltr" className="px-4 py-3 text-start">{row.phone ?? '-'}</td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`reg-status-${row.id}`}>
                      {t('colStatus')}
                    </label>
                    <select
                      id={`reg-status-${row.id}`}
                      className="input min-h-10 py-1"
                      value={row.status}
                      disabled={busyId === row.id}
                      onChange={(e) => handleStatusChange(row, e.target.value as RegistrationStatus)}
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {t(REGISTRATION_STATUS_KEYS[value])}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(row.created_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en-GB')}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      type="button"
                      className="btn-ghost min-h-10 px-3 text-danger"
                      disabled={busyId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      {t('adminDelete')}
                      <span className="sr-only">: {row.full_name}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && <AdminPager page={page} total={total} onPage={setPage} />}
    </div>
  );
}
