import { useTheme } from '@/providers/ThemeProvider';
import { useChangeLanguage, useT } from 'next-i18next/client';

export function useSettings() {
  const { t, i18n } = useT('common');
  const { theme, setTheme } = useTheme();
  const changeLanguage = useChangeLanguage();

  const themeLabels = {
    light: t('settings.themes.light'),
    dark: t('settings.themes.dark'),
    system: t('settings.themes.system'),
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pl', label: 'Polish' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'es', label: 'Spanish' },
    { value: 'uk', label: 'Ukrainian' },
  ];

  const language = i18n.resolvedLanguage ?? i18n.language;

  const handleThemeChange = (value: string | null) => {
    if (value !== 'light' && value !== 'dark' && value !== 'system') {
      return;
    }
    setTheme(value);
  };

  const handleLanguageChange = (value: string | null) => {
    if (!value) return;
    changeLanguage(value);
  };

  return {
    t,
    theme,
    themeLabels,
    languages,
    language,
    handleThemeChange,
    handleLanguageChange,
  };
}
