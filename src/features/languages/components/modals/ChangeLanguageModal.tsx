'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { Input } from '@/components/ui/input';
import type { AdminLanguageFormValues } from '@/lib/validations/admin-language';
import { useTranslation } from 'react-i18next';

type ChangeLanguageModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  formData: AdminLanguageFormValues;
  errors: Partial<Record<keyof AdminLanguageFormValues, string>>;
  loading: boolean;
  duplicateName: boolean;
  duplicateIso: boolean;
  handleChange: (
    field: keyof AdminLanguageFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<boolean>;
  isValid: boolean;
};

export function ChangeLanguageModal({
  type,
  trigger,
  open,
  onOpenChange,
  formData,
  errors,
  loading,
  duplicateName,
  duplicateIso,
  handleChange,
  handleSubmit,
  isValid,
}: ChangeLanguageModalProps) {
  const { t } = useTranslation();
  const handleIsoChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.toUpperCase().slice(0, 2);
    handleChange('iso2')(event);
  };

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="language"
      onConfirm={handleSubmit}
      confirmDisabled={!isValid || loading}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-8">
        <Input
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={t('languages.admin.name')}
          required
          error={
            errors.name
              ? t(errors.name)
              : duplicateName
                ? t('languages.admin.validation.duplicateName')
                : undefined
          }
        />

        <Input
          value={formData.iso2}
          onChange={handleIsoChange}
          placeholder={t('languages.admin.iso')}
          maxLength={2}
          required
          error={
            errors.iso2
              ? t(errors.iso2)
              : duplicateIso
                ? t('languages.admin.validation.duplicateIso')
                : undefined
          }
        />

        <Input
          value={formData.nativeName}
          onChange={handleChange('nativeName')}
          placeholder={t('languages.admin.nativeName')}
          required
          error={errors.nativeName ? t(errors.nativeName) : undefined}
        />
      </div>
    </ChangeDialog>
  );
}
