'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import type { ApiLanguage } from '@/api/languages';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AddUserLanguageFormValues } from '@/lib/validations/language';
import { proficiencyValues } from '@/lib/validations/language';
import { useTranslation } from 'react-i18next';

type ChangeUserLanguageModalProps = {
  type: createActionTitles | updateActionTitles;
  languages: ApiLanguage[];
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  languageDisabled?: boolean;
  formData: AddUserLanguageFormValues;
  errors: Partial<Record<keyof AddUserLanguageFormValues, string>>;
  loading: boolean;
  isValid: boolean;
  setFieldValue: (
    field: keyof AddUserLanguageFormValues,
    value: string,
    options?: {
      shouldValidate?: boolean;
    },
  ) => void;
  validateField: (field: keyof AddUserLanguageFormValues) => boolean;
  handleSubmit: () => Promise<boolean>;
};

export function ChangeUserLanguageModal({
  type,
  languages,
  trigger,
  open,
  onOpenChange,
  languageDisabled = false,
  formData,
  errors,
  loading,
  isValid,
  setFieldValue,
  validateField,
  handleSubmit,
}: ChangeUserLanguageModalProps) {
  const { t } = useTranslation();

  const selectedFieldsRef = React.useRef<Set<keyof AddUserLanguageFormValues>>(
    new Set(),
  );

  const handleSelectValue = (
    field: keyof AddUserLanguageFormValues,
    value: string | null,
  ) => {
    if (!value) return;

    selectedFieldsRef.current.add(field);
    setFieldValue(field, value, { shouldValidate: true });
  };

  const handleSelectOpenChange = (
    field: keyof AddUserLanguageFormValues,
    isOpen: boolean,
  ) => {
    if (isOpen) {
      selectedFieldsRef.current.delete(field);
      return;
    }

    if (!selectedFieldsRef.current.delete(field)) {
      validateField(field);
    }
  };

  const languageItems = languages.map((language) => ({
    value: language.name,
    label: language.name,
  }));

  const proficiencyItems = proficiencyValues.map((proficiency) => ({
    value: proficiency,
    label: proficiency,
  }));

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="language"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleSubmit}
      confirmDisabled={!isValid || loading}
      size="sm"
    >
      <div className="flex flex-col gap-9">
        <div>
          <Select
            items={languageItems}
            value={formData.languageName}
            disabled={languageDisabled}
            onValueChange={(value) => handleSelectValue('languageName', value)}
            onOpenChange={(isOpen) =>
              handleSelectOpenChange('languageName', isOpen)
            }
          >
            <SelectTrigger
              label={t('users.languages.language')}
              className="border-[#AEAEAE] bg-secondary"
              error={errors.languageName ? t(errors.languageName) : undefined}
              aria-label={t('users.languages.language')}
              aria-invalid={Boolean(errors.languageName)}
            >
              <SelectValue placeholder={t('users.languages.language')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {languageItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            items={proficiencyItems}
            value={formData.proficiency}
            onValueChange={(value) => handleSelectValue('proficiency', value)}
            onOpenChange={(isOpen) =>
              handleSelectOpenChange('proficiency', isOpen)
            }
          >
            <SelectTrigger
              label={t('users.languages.proficiency')}
              className="border-[#AEAEAE] bg-secondary"
              error={errors.proficiency ? t(errors.proficiency) : undefined}
              aria-label={t('users.languages.proficiency')}
              aria-invalid={Boolean(errors.proficiency)}
            >
              <SelectValue placeholder={t('users.languages.proficiency')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {proficiencyItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ChangeDialog>
  );
}
