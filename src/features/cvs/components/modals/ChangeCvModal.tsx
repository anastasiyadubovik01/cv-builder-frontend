'use client';

import React, { ChangeEvent } from 'react';
import type { TFunction } from 'i18next';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import type { CreateCvFormValues } from '@/lib/validations/cv';

export interface ChangeCvModalProps {
  type: createActionTitles | updateActionTitles;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  formData: CreateCvFormValues;
  errors: Partial<Record<keyof CreateCvFormValues, string>>;
  loading: boolean;
  isValid: boolean;
  handleChange: (
    field: keyof CreateCvFormValues,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  validateField: (field: keyof CreateCvFormValues) => boolean;
  handleSubmit: () => Promise<boolean>;
  t: TFunction;
}

export function ChangeCvModal({
  type,
  trigger,
  open,
  onOpenChange,
  formData,
  errors,
  loading,
  isValid,
  handleChange,
  validateField,
  handleSubmit,
  t,
}: ChangeCvModalProps) {
  return (
    <ChangeDialog
      actionTitle={type}
      itemType="CV"
      onConfirm={handleSubmit}
      confirmDisabled={!isValid || loading}
      trigger={trigger}
      t={t}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-9">
        <Input
          value={formData.name}
          onChange={handleChange('name')}
          onBlur={() => validateField('name')}
          placeholder={t('cvs.name', 'Name')}
          required
          error={errors.name ? t(errors.name, 'Name is required') : undefined}
        />

        <Input
          value={formData.education}
          onChange={handleChange('education')}
          onBlur={() => validateField('education')}
          placeholder={t('cvs.education', 'Education')}
          required
          error={
            errors.education
              ? t(errors.education, 'Education is required')
              : undefined
          }
        />

        <Textarea
          value={formData.description}
          onChange={handleChange('description')}
          onBlur={() => validateField('description')}
          placeholder={t('cvs.description', 'Description')}
          required
          error={
            errors.description
              ? t(errors.description, 'Description is required')
              : undefined
          }
        />
      </div>
    </ChangeDialog>
  );
}
