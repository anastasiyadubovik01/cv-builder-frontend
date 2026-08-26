'use client';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useChangePasswordForm } from '@/features/settings/hooks/useChangePasswordForm';

export function ChangePasswordForm() {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    loading,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useChangePasswordForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-9" noValidate>
      <PasswordInput
        aria-label={t('settings.password')}
        placeholder={t('settings.password')}
        value={formData.oldPassword}
        onChange={handleChange('oldPassword')}
        onBlur={handleBlur('oldPassword')}
        required
        error={errors.oldPassword ? t(errors.oldPassword) : undefined}
      />

      <PasswordInput
        aria-label={t('settings.newPassword')}
        placeholder={t('settings.newPassword')}
        value={formData.newPassword}
        onChange={handleChange('newPassword')}
        onBlur={handleBlur('newPassword')}
        required
        error={errors.newPassword ? t(errors.newPassword) : undefined}
      />

      <PasswordInput
        aria-label={t('settings.confirmPassword')}
        placeholder={t('settings.confirmPassword')}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        onBlur={handleBlur('confirmPassword')}
        required
        error={errors.confirmPassword ? t(errors.confirmPassword) : undefined}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isValid || loading}
          className="min-w-[160px]"
        >
          {t('settings.change')}
        </Button>
      </div>
    </form>
  );
}
