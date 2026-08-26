'use client';

import * as React from 'react';
import type { TFunction } from 'i18next';
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
  t: TFunction;
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
  t,
}: ChangeUserLanguageModalProps) {
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
      t={t}
    >
      <div className="flex flex-col gap-9">
        <div>
          <Select
            items={languageItems}
            value={formData.languageName}
            disabled={languageDisabled}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('languageName', value, {
                  shouldValidate: true,
                });
              }
            }}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                validateField('languageName');
              }
            }}
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
            onValueChange={(value) => {
              if (value) {
                setFieldValue('proficiency', value, {
                  shouldValidate: true,
                });
              }
            }}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                validateField('proficiency');
              }
            }}
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
