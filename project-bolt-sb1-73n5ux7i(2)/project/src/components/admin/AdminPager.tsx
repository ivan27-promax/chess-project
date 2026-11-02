import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { PAGE_SIZE } from '@/lib/admin/members';

export function AdminPager({ page, total, onPage }: { page: number; total: number; onPage: (page: number) => void }) {
  const { t } = useLanguage();
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <nav aria-label={t('pagination')} className="mt-6 flex items-center justify-between gap-4">
      <button type="button" className="btn-secondary" disabled={page === 0} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {t('actionPrevious')}
      </button>
      <span className="text-sm text-muted" aria-live="polite">
        {t('adminPageOf', { page: page + 1, total: pages })}
      </span>
      <button type="button" className="btn-secondary" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>
        {t('actionNext')}
        <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </button>
    </nav>
  );
}
