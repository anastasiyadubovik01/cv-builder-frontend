'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { Input } from '@/components/ui/input';
import type { AdminDepartmentFormValues } from '@/lib/validations/admin-department';
import { useTranslation } from 'react-i18next';

type ChangeDepartmentModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  formData: AdminDepartmentFormValues;
  errors: Partial<Record<keyof AdminDepartmentFormValues, string>>;
  loading: boolean;
  duplicateName: boolean;
  handleChange: (
    field: keyof AdminDepartmentFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => Promise<boolean>;
};

export function ChangeDepartmentModal({
  type,
  trigger,
  open,
  onOpenChange,
  formData,
  errors,
  loading,
  duplicateName,
  handleChange,
  handleSubmit,
}: ChangeDepartmentModalProps) {
  const { t } = useTranslation();
  return (
    <ChangeDialog
      actionTitle={type}
      itemType="department"
      onConfirm={handleSubmit}
      confirmDisabled={loading}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-8">
        <Input
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={t('departments.name')}
          required
          error={
            errors.name
              ? t(errors.name)
              : duplicateName
                ? t('departments.validation.duplicateName')
                : undefined
          }
        />
      </div>
    </ChangeDialog>
  );
}
