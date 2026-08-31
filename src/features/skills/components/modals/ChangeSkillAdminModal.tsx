'use client';

import type { ReactNode } from 'react';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AdminSkillFormValues } from '@/lib/validations/admin-skill';
import { useTranslation } from 'react-i18next';

export type SkillFormCategory = {
  id: string;
  name: string;
};

type ChangeSkillModalProps = {
  type: createActionTitles | updateActionTitles;
  categories: SkillFormCategory[];
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  formData: AdminSkillFormValues;
  errors: Partial<Record<keyof AdminSkillFormValues, string>>;
  loading: boolean;
  isValid: boolean;
  isDuplicate: boolean;
  setFieldValue: (
    field: keyof AdminSkillFormValues,
    value: string,
    options?: {
      shouldValidate?: boolean;
    },
  ) => void;
  validateField: (field: keyof AdminSkillFormValues) => boolean;
  handleSubmit: () => Promise<boolean>;
};

export function ChangeSkillAdminModal({
  type,
  categories,
  trigger,
  open,
  onOpenChange,
  formData,
  errors,
  loading,
  isValid,
  isDuplicate,
  setFieldValue,
  validateField,
  handleSubmit,
}: ChangeSkillModalProps) {
  const { t } = useTranslation();
  const categoryItems = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const nameError = errors.name
    ? t(errors.name)
    : isDuplicate
      ? t('skills.admin.validation.duplicate')
      : null;

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="skill"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleSubmit}
      confirmDisabled={!isValid || loading}
      size="sm"
    >
      <div className="flex flex-col gap-9">
        <div>
          <Input
            value={formData.name}
            placeholder={t('skills.admin.name')}
            aria-label={t('skills.admin.name')}
            aria-invalid={Boolean(nameError)}
            onChange={(event) => setFieldValue('name', event.target.value)}
            onBlur={() => validateField('name')}
          />

          {nameError && (
            <p className="mt-1 ml-3 text-xs text-destructive">{nameError}</p>
          )}
        </div>

        <div>
          <Select
            items={categoryItems}
            value={formData.categoryId}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('categoryId', value, {
                  shouldValidate: true,
                });
              }
            }}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                validateField('categoryId');
              }
            }}
          >
            <SelectTrigger
              label={t('skills.admin.category')}
              className="border-[#AEAEAE] bg-secondary"
              error={errors.categoryId ? t(errors.categoryId) : undefined}
              aria-label={t('skills.admin.category')}
              aria-invalid={Boolean(errors.categoryId)}
            >
              <SelectValue placeholder={t('skills.admin.category')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {categoryItems.map(({ value, label }) => (
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
