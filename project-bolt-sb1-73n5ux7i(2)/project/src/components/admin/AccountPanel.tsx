import { useEffect, useState, type FormEvent } from 'react';
import { Notice } from '@/components/FormField';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/translations';
import { getCurrentSession, updateAdminCredentials, verifyAdminPassword } from '@/lib/admin/auth';
import { isValidEmail, normalizeEmail } from '@/lib/validation';

const MIN_PASSWORD_LENGTH = 8;

type Success = { emailChanged: boolean };

export function AccountPanel() {
  const { t } = useLanguage();
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<TranslationKey | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentSession()
      .then((session) => setCurrentEmail(session?.user.email ?? ''))
      .catch(() => setCurrentEmail(''));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);

    const email = normalizeEmail(newEmail);
    const wantsEmail = email.length > 0;
    const wantsPassword = newPassword.length > 0;

    if (!wantsEmail && !wantsPassword) {
      setError('accountNothingToChange');
      return;
    }
    if (wantsEmail && !isValidEmail(email)) {
      setError('errEmail');
      return;
    }
    if (wantsPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      setError('accountPasswordShort');
      return;
    }
    if (wantsPassword && newPassword !== confirmPassword) {
      setError('accountPasswordMismatch');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!(await verifyAdminPassword(currentPassword))) {
        setError('accountWrongPassword');
        return;
      }
      await updateAdminCredentials({
        ...(wantsEmail ? { email } : {}),
        ...(wantsPassword ? { password: newPassword } : {}),
      });
      setSuccess({ emailChanged: wantsEmail });
      setCurrentPassword('');
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('adminActionError');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <p className="text-muted">{t('accountIntro')}</p>
      <form onSubmit={handleSubmit} noValidate className="card space-y-6">
        {error && <Notice tone="error">{t(error)}</Notice>}
        {success && (
          <Notice tone="success">
            <p>{t('accountUpdated')}</p>
            {success.emailChanged && <p className="mt-2">{t('accountEmailConfirmHint')}</p>}
          </Notice>
        )}
        <div className="space-y-2">
          <label htmlFor="account-current-password" className="field-label">
            {t('accountCurrentPassword')}
          </label>
          <input
            id="account-current-password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            className="input"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="account-new-email" className="field-label">
              {t('accountNewEmail')}
            </label>
            <input
              id="account-new-email"
              type="email"
              autoComplete="email"
              dir="ltr"
              placeholder={currentEmail}
              className="input"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="account-new-password" className="field-label">
              {t('accountNewPassword')}
            </label>
            <input
              id="account-new-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              className="input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="account-confirm-password" className="field-label">
            {t('accountConfirmPassword')}
          </label>
          <input
            id="account-confirm-password"
            type="password"
            autoComplete="new-password"
            dir="ltr"
            className="input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t('accountUpdating') : t('accountUpdate')}
          </button>
        </div>
      </form>
    </div>
  );
}
