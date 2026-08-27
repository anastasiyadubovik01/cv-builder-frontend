'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { ChangePasswordForm } from './ChangePasswordForm';

export function SettingsContent() {
  const {
    t,
    theme,
    themeLabels,
    languages,
    language,
    handleThemeChange,
    handleLanguageChange,
  } = useSettings();

  return (
    <div className="mx-auto w-full max-w-[852px] px-6 pt-10">
      <div className="flex flex-col gap-8">
        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger label={t('settings.theme')}>
            <SelectValue>
              {themeLabels[theme as keyof typeof themeLabels]}
            </SelectValue>
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
