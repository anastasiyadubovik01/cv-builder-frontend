'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useChangeLanguage, useT } from 'next-i18next/client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ChangePasswordForm } from './ChangePasswordForm';

export function SettingsContent() {
  const { t, i18n } = useT('common');
  const { theme, setTheme } = useTheme();

  const themeLabels = {
    light: t('settings.themes.light'),
    dark: t('settings.themes.dark'),
    system: t('settings.themes.system'),
  };

  const handleThemeChange = (value: string | null) => {
    if (value !== 'light' && value !== 'dark' && value !== 'system') {
      return;
    }

    setTheme(value);
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

  const changeLanguage = useChangeLanguage();

  const language = i18n.resolvedLanguage ?? i18n.language;

  const handleLanguageChange = (value: string | null) => {
    if (!value) return;

    changeLanguage(value);
  };

  return (
    <div className="mx-auto w-full max-w-[852px] px-6 pt-10">
      <div className="flex flex-col gap-8">
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger label={t('settings.theme')}>
            <SelectValue>{themeLabels[theme]}</SelectValue>
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="light">{t('settings.themes.light')}</SelectItem>

            <SelectItem value="dark">{t('settings.themes.dark')}</SelectItem>

            <SelectItem value="system">
              {t('settings.themes.system')}
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger label={t('settings.language')}>
            <SelectValue>
              {languages.find((item) => item.value === language)?.label}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {languages.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-10">
          <h2 className="mb-6 text-base">{t('settings.changePassword')}</h2>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
