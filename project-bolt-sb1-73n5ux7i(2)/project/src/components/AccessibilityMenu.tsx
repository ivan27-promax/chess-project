import { useEffect, useId, useRef, useState } from 'react';
import { Accessibility, X } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { usePreferences, type FontScale, type ThemeChoice } from '@/preferences/PreferencesProvider';

export function AccessibilityMenu() {
  const { t } = useLanguage();
  const { theme, setTheme, fontScale, setFontScale, highContrast, setHighContrast } = usePreferences();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const themeOptions: { value: ThemeChoice; label: string }[] = [
    { value: 'system', label: t('themeSystem') },
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
  ];

  const fontOptions: { value: FontScale; label: string }[] = [
    { value: 'normal', label: t('fontNormal') },
    { value: 'large', label: t('fontLarge') },
    { value: 'xlarge', label: t('fontXlarge') },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="btn-secondary min-h-11 min-w-11 px-3"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">{t('accessibility')}</span>
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute end-0 z-50 mt-2 w-72 rounded-xl border border-border bg-surface p-5 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{t('accessibility')}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost min-h-11 min-w-11 px-2"
              aria-label={t('close')}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <fieldset className="mb-5">
            <legend className="field-label">{t('themeLabel')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors ${
                    theme === option.value ? 'border-gold bg-gold text-on-gold' : 'border-border text-ink hover:border-gold'
                  }`}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={theme === option.value}
                    onChange={() => setTheme(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mb-5">
            <legend className="field-label">{t('fontLabel')}</legend>
            <div className="grid grid-cols-3 gap-2">
              {fontOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex min-h-11 cursor-pointer items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors ${
                    fontScale === option.value ? 'border-gold bg-gold text-on-gold' : 'border-border text-ink hover:border-gold'
                  }`}
                >
                  <input
                    type="radio"
                    name="font-size"
                    value={option.value}
                    checked={fontScale === option.value}
                    onChange={() => setFontScale(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
            <span className="font-medium">{t('contrastLabel')}</span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) => setHighContrast(event.target.checked)}
              className="h-5 w-5 accent-[rgb(var(--c-gold))]"
            />
          </label>
        </div>
      )}
    </div>
  );
}
