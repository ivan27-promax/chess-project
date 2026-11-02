import { ExternalLink } from 'lucide-react';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import { fetchActiveSponsors } from '@/lib/publicApi';
import { isSafeHttpsUrl } from '@/lib/validation';
import { useAsyncData } from '@/lib/useAsyncData';

export function SponsorsPage() {
  const { t, pick } = useLanguage();
  const sponsors = useAsyncData(fetchActiveSponsors, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="eyebrow">{t('navSponsors')}</p>
      <h1 className="mt-3 text-4xl">{t('sponsorsTitle')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{t('sponsorsIntro')}</p>

      <div className="mt-12">
        {sponsors.loading && <p className="text-muted">{t('loading')}</p>}
        {sponsors.error && (
          <Notice tone="error">
            <p>{t('loadError')}</p>
            <button type="button" onClick={sponsors.reload} className="btn-ghost mt-2 px-0 text-danger">
              {t('retry')}
            </button>
          </Notice>
        )}
        {sponsors.data && sponsors.data.length === 0 && <p className="text-muted">{t('emptySponsors')}</p>}
        {sponsors.data && sponsors.data.length > 0 && (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.data.map((sponsor) => {
              const description = pick(sponsor.description_en, sponsor.description_ar);
              const logo = sponsor.logo_url && isSafeHttpsUrl(sponsor.logo_url) ? sponsor.logo_url : null;
              const website = sponsor.website_url && isSafeHttpsUrl(sponsor.website_url) ? sponsor.website_url : null;
              return (
                <li key={sponsor.id} className="card flex flex-col gap-4">
                  {logo ? (
                    <img
                      src={logo}
                      alt={sponsor.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-16 w-auto max-w-[60%] object-contain object-left"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gold">{sponsor.name}</span>
                  )}
                  {logo && <h2 className="text-xl">{sponsor.name}</h2>}
                  {description && <p className="text-muted">{description}</p>}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost mt-auto px-0 text-gold"
                    >
                      {t('sponsorVisit')}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">: {sponsor.name}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
