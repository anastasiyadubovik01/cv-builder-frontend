'use client';

import type { ChangeEvent, ReactNode } from 'react';
import type { TFunction } from 'i18next';

import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { Input } from '@/components/ui/input';
import type { AdminPositionFormValues } from '@/lib/validations/admin-position';

type ChangePositionModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  formData: AdminPositionFormValues;
  errors: Partial<Record<keyof AdminPositionFormValues, string>>;
  loading: boolean;
  duplicateName: boolean;

  handleChange: (
    field: keyof AdminPositionFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;

  handleSubmit: () => Promise<boolean>;

  t: TFunction;
};

export function ChangePositionModal({
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
  t,
}: ChangePositionModalProps) {
  return (
    <ChangeDialog
      actionTitle={type}
      itemType="position"
      onConfirm={handleSubmit}
      confirmDisabled={loading}
      trigger={trigger}
      t={t}
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-8">
        <Input
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={t('positions.name')}
          required
          error={
            errors.name
              ? t(errors.name)
              : duplicateName
                ? t('positions.validation.duplicateName')
                : undefined
          }
        />
      </div>
    </ChangeDialog>
  );
}
