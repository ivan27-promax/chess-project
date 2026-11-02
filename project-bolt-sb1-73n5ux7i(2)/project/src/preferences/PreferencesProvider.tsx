import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStoredChoice, writeStoredChoice } from '@/lib/storage';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type FontScale = 'normal' | 'large' | 'xlarge';

const THEME_KEY = '8squared-theme';
const FONT_KEY = '8squared-font';
const CONTRAST_KEY = '8squared-contrast';
const THEMES: readonly ThemeChoice[] = ['system', 'light', 'dark'];
const FONTS: readonly FontScale[] = ['normal', 'large', 'xlarge'];
const CONTRAST_VALUES = ['on', 'off'] as const;

type PreferencesContextValue = {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => readStoredChoice(THEME_KEY, THEMES, 'system'));
  const [fontScale, setFontScaleState] = useState<FontScale>(() => readStoredChoice(FONT_KEY, FONTS, 'normal'));
  const [highContrast, setHighContrastState] = useState<boolean>(() => readStoredChoice(CONTRAST_KEY, CONTRAST_VALUES, 'off') === 'on');
  const [systemDark, setSystemDark] = useState<boolean>(() => systemPrefersDark());

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.dataset.font = fontScale;
    if (highContrast) {
      root.dataset.contrast = 'high';
    } else {
      delete root.dataset.contrast;
    }
  }, [resolvedTheme, fontScale, highContrast]);

  const setTheme = useCallback((next: ThemeChoice) => {
    writeStoredChoice(THEME_KEY, next);
    setThemeState(next);
  }, []);

  const setFontScale = useCallback((next: FontScale) => {
    writeStoredChoice(FONT_KEY, next);
    setFontScaleState(next);
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    writeStoredChoice(CONTRAST_KEY, enabled ? 'on' : 'off');
    setHighContrastState(enabled);
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ theme, setTheme, fontScale, setFontScale, highContrast, setHighContrast }),
    [theme, setTheme, fontScale, setFontScale, highContrast, setHighContrast],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
