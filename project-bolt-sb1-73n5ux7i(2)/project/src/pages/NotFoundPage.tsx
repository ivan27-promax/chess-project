import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';

export function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-start gap-6 px-4 py-24 sm:px-6">
      <p className="eyebrow">404</p>
      <h1 className="text-4xl">{t('notFoundTitle')}</h1>
      <p className="text-lg text-muted">{t('notFoundBody')}</p>
      <a href="#/" className="btn-primary">
        {t('backHome')}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
      </a>
    </section>
  );
}
