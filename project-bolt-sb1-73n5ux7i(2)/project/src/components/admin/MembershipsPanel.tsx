import { useState, type FormEvent } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import { AdminPager } from '@/components/admin/AdminPager';
import { Modal } from '@/components/Modal';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import {
  deleteMembershipRequest,
  exportMembershipRequests,
  listMembershipRequests,
  updateMembershipStatus,
} from '@/lib/admin/members';
import { buildCsv, downloadCsv } from '@/lib/csv';
import { LEVEL_KEYS, MEMBERSHIP_STATUS_KEYS, YEARS_KEYS } from '@/lib/labels';
import { useAsyncData } from '@/lib/useAsyncData';
import type { MembershipRequest, MembershipStatus } from '@/types/club';

const STATUSES: MembershipStatus[] = ['new', 'accepted', 'waitlisted', 'rejected'];

export function MembershipsPanel() {
  const { t, language } = useLanguage();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [draftSearch, setDraftSearch] = useState('');
  const [status, setStatus] = useState<'all' | MembershipStatus>('all');
  const [selected, setSelected] = useState<MembershipRequest | null>(null);
  const [actionError, setActionError] = useState<TranslationKey | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const list = useAsyncData(
    () => listMembershipRequests({ page, search, status }),
    [page, search, status],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setSearch(draftSearch);
  };

  const runAction = async (id: string, action: () => Promise<void>, failedKey: TranslationKey = 'actionFailed') => {
    setBusyId(id);
    setActionError(null);
    try {
      await action();
      list.reload();
    } catch {
      setActionError(failedKey);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = (row: MembershipRequest, next: MembershipStatus) =>
    runAction(row.id, () => updateMembershipStatus(row.id, next));

  const handleDelete = (row: MembershipRequest) => {
    if (!window.confirm(t('confirmDeleteMembership'))) return;
    void runAction(row.id, () => deleteMembershipRequest(row.id), 'deleteFailed');
  };

  const handleExport = async () => {
    setExporting(true);
    setActionError(null);
    try {
      const rows = await exportMembershipRequests();
      const csv = buildCsv(rows, [
        { header: t('columnName'), value: (row) => row.full_name },
        { header: t('columnEmail'), value: (row) => row.email },
        { header: t('columnUniversity'), value: (row) => row.university },
        { header: t('fieldPhone'), value: (row) => row.phone },
        { header: t('columnLevel'), value: (row) => t(LEVEL_KEYS[row.level]) },
        { header: t('fieldYears'), value: (row) => (row.years_playing ? t(YEARS_KEYS[row.years_playing]) : '') },
        { header: t('fieldFide'), value: (row) => row.fide_rating },
        { header: t('fieldInterests'), value: (row) => row.interests },
        { header: t('fieldMessage'), value: (row) => row.message },
        { header: t('columnStatus'), value: (row) => t(MEMBERSHIP_STATUS_KEYS[row.status]) },
        { header: t('columnDate'), value: (row) => row.created_at },
      ]);
      downloadCsv(`8squared-membership-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    } catch {
      setActionError('actionFailed');
    } finally {
      setExporting(false);
    }
  };

  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form onSubmit={handleSearch} role="search" className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-2">
            <label htmlFor="membership-search" className="field-label">
              {t('searchLabel')}
            </label>
            <input
              id="membership-search"
              type="search"
              className="input"
              placeholder={t('searchPlaceholder')}
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="membership-status" className="field-label">
              {t('filterStatus')}
            </label>
            <select
              id="membership-status"
              className="input"
              value={status}
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value as 'all' | MembershipStatus);
              }}
            >
              <option value="all">{t('statusAll')}</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(MEMBERSHIP_STATUS_KEYS[value])}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-secondary self-stretch sm:self-end">
            {t('actionSearch')}
          </button>
        </form>
        <button type="button" onClick={handleExport} disabled={exporting} className="btn-primary">
          <Download className="h-4 w-4" aria-hidden="true" />
          {exporting ? t('actionExporting') : t('actionExportCsv')}
        </button>
      </div>

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
      {list.data && rows.length === 0 && <p className="text-muted">{t('noResults')}</p>}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-start text-sm">
            <thead className="bg-surface-2 text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('columnName')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('columnUniversity')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('columnLevel')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('columnStatus')}</th>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{t('columnDate')}</th>
                <th scope="col" className="px-4 py-3 text-end font-semibold">{t('columnActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-surface-2">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{row.full_name}</div>
                    <div dir="ltr" className="text-muted">{row.email}</div>
                  </td>
                  <td className="px-4 py-3">{row.university}</td>
                  <td className="px-4 py-3">{t(LEVEL_KEYS[row.level])}</td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`status-${row.id}`}>
                      {t('columnStatus')}
                    </label>
                    <select
                      id={`status-${row.id}`}
                      className="input min-h-10 py-1"
                      value={row.status}
                      disabled={busyId === row.id}
                      onChange={(event) => handleStatusChange(row, event.target.value as MembershipStatus)}
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {t(MEMBERSHIP_STATUS_KEYS[value])}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(row.created_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en-GB')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" className="btn-ghost min-h-10 px-3" onClick={() => setSelected(row)}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        <span>{t('actionView')}</span>
                        <span className="sr-only">: {row.full_name}</span>
                      </button>
                      <button
                        type="button"
                        className="btn-ghost min-h-10 px-3 text-danger"
                        onClick={() => handleDelete(row)}
                        disabled={busyId === row.id}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        <span>{t('actionDelete')}</span>
                        <span className="sr-only">: {row.full_name}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && <AdminPager page={page} total={total} onPage={setPage} />}

      {selected && (
        <Modal title={selected.full_name} onClose={() => setSelected(null)}>
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label={t('fieldEmail')} value={selected.email} ltr />
            <DetailItem label={t('fieldPhone')} value={selected.phone} ltr />
            <DetailItem label={t('fieldUniversity')} value={selected.university} />
            <DetailItem label={t('columnLevel')} value={t(LEVEL_KEYS[selected.level])} />
            <DetailItem label={t('fieldYears')} value={selected.years_playing ? t(YEARS_KEYS[selected.years_playing]) : null} />
            <DetailItem label={t('fieldFide')} value={selected.fide_rating?.toString() ?? null} ltr />
            <DetailItem label={t('fieldInterests')} value={selected.interests} />
            <DetailItem label={t('columnStatus')} value={t(MEMBERSHIP_STATUS_KEYS[selected.status])} />
            <div className="sm:col-span-2">
              <DetailItem label={t('fieldMessage')} value={selected.message} />
            </div>
          </dl>
        </Modal>
      )}
    </div>
  );
}

function DetailItem({ label, value, ltr }: { label: string; value: string | null; ltr?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-1">
      <dt className="text-sm font-semibold text-muted">{label}</dt>
      <dd dir={ltr ? 'ltr' : undefined} className="whitespace-pre-line break-words text-ink">
        {value || t('notProvided')}
      </dd>
    </div>
  );
}
