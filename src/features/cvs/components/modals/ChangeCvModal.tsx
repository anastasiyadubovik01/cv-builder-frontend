'use client';

import React from 'react';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCvForm } from '@/features/cvs/hooks/useCreateCvForm';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';

export interface ChangeCvModalProps {
  type: createActionTitles | updateActionTitles;
  trigger: React.ReactNode;
  userId?: string;
  onSuccess?: () => void;
  onSubmit?: (data: {
    name: string;
    education: string;
    description: string;
  }) => void;
}

export function ChangeCvModal({
  type,
  trigger,
  userId,
  onSuccess,
  onSubmit,
}: ChangeCvModalProps) {
  const {
    formData,
    errors,
    validateForm,
    handleChange,
    handleSubmit,
    resetForm,
    t,
  } = useCreateCvForm({
    userId,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleConfirm = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    if (onSubmit) {
      onSubmit(formData);
      resetForm();
      return true;
    }

    return await handleSubmit();
  };

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="CV"
      onConfirm={handleConfirm}
      trigger={trigger}
      t={t}
    >
      <div className="flex flex-col gap-9">
        <Input
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={t('cvs.name', 'Name')}
          required
          error={errors.name ? t(errors.name, 'Name is required') : undefined}
        />

        <Input
          value={formData.education}
          onChange={handleChange('education')}
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
