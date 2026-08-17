'use client';

import React from 'react';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCvForm } from '@/features/cvs/hooks/useCreateCvForm';
import { useUpdateCvForm } from '@/features/cvs/hooks/useUpdateCvForm';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import type { CreateCvFormValues } from '@/lib/validations/cv';

export interface ChangeCvModalProps {
  type: createActionTitles | updateActionTitles;
  trigger?: React.ReactNode;
  cvId?: string;
  userId?: string;
  initialValues?: CreateCvFormValues;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  onSubmit?: (data: CreateCvFormValues) => void;
}

export function ChangeCvModal({
  type,
  trigger,
  cvId,
  userId,
  initialValues,
  open,
  onOpenChange,
  onSuccess,
  onSubmit,
}: ChangeCvModalProps) {
  const isUpdate = type === 'Update';

  const defaultInitialValues: CreateCvFormValues = initialValues || {
    name: '',
    education: '',
    description: '',
  };

  const createForm = useCreateCvForm({
    userId,
    onSuccess,
  });

  const updateForm = useUpdateCvForm({
    cvId: cvId || '',
    initialValues: defaultInitialValues,
    onSuccess,
  });

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    handleSubmit,
    resetForm,
    t,
  } = isUpdate ? updateForm : createForm;

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
      open={open}
      onOpenChange={onOpenChange}
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
