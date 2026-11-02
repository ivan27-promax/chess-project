import { useLanguage } from '@/i18n/LanguageProvider';
import { LEGAL_DOCUMENTS, LEGAL_UPDATED } from '@/i18n/legal';

export function LegalPage() {
  const { t, language } = useLanguage();
  const updated = new Date(LEGAL_UPDATED).toLocaleDateString(language === 'ar' ? 'ar' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-4xl">{t('legalTitle')}</h1>
      <p className="mt-3 text-sm text-muted">{t('legalUpdated', { date: updated })}</p>

      {LEGAL_DOCUMENTS[language].map((document) => (
        <article key={document.title} className="mt-12 space-y-10">
          <h2 className="border-b border-border pb-3 text-2xl text-gold">{document.title}</h2>
          {document.sections.map((section) => (
            <div key={section.heading} className="space-y-3">
              <h3 className="text-lg font-semibold">{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </article>
      ))}
    </section>
  );
}
