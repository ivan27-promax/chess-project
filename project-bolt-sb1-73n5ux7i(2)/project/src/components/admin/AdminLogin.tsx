import { useState, type FormEvent } from 'react';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import { signInAdmin } from '@/lib/admin/auth';
import { isValidEmail } from '@/lib/validation';

export function AdminLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidEmail(email) || password.length === 0) {
      setFailed(true);
      return;
    }
    setSubmitting(true);
    setFailed(false);
    try {
      await signInAdmin(email, password);
      setPassword('');
      onSignedIn();
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="eyebrow">{t('adminTitle')}</p>
      <h1 className="mt-3 text-4xl">{t('adminLoginTitle')}</h1>
      <p className="mt-4 text-muted">{t('adminLoginIntro')}</p>

      <form onSubmit={handleSubmit} noValidate className="card mt-10 space-y-6">
        {failed && <Notice tone="error">{t('adminLoginError')}</Notice>}
        <div className="space-y-2">
          <label htmlFor="admin-email" className="field-label">
            {t('fieldEmail')}
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            dir="ltr"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-password" className="field-label">
            {t('adminPassword')}
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? t('adminSigningIn') : t('adminSignIn')}
        </button>
      </form>
    </section>
  );
}
