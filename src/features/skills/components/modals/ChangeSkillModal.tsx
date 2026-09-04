'use client';

import * as React from 'react';
import type { ReactNode } from 'react';
import type { ApiSkill } from '@/api/skills';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Mastery } from '@/features/skills/types';
import type { AddSkillFormValues } from '@/lib/validations/skill';
import { useTranslation } from 'react-i18next';

type ChangeUserSkillModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  skillDisabled?: boolean;
  skills: ApiSkill[];
  formData: AddSkillFormValues;
  errors: Partial<Record<keyof AddSkillFormValues, string>>;
  loading: boolean;
  isValid: boolean;
  setFieldValue: (
    field: keyof AddSkillFormValues,
    value: string,
    options?: {
      shouldValidate?: boolean;
    },
  ) => void;
  validateField: (field: keyof AddSkillFormValues) => boolean;
  handleSubmit: () => Promise<boolean>;
};

const masteryItems: {
  value: Mastery;
  label: string;
}[] = [
  { value: 'Novice', label: 'Novice' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Competent', label: 'Competent' },
  { value: 'Proficient', label: 'Proficient' },
  { value: 'Expert', label: 'Expert' },
];

export function ChangeSkillModal({
  type,
  trigger,
  open,
  onOpenChange,
  skillDisabled = false,
  skills,
  formData,
  errors,
  loading,
  isValid,
  setFieldValue,
  validateField,
  handleSubmit,
}: ChangeUserSkillModalProps) {
  const { t } = useTranslation();

  const selectedFieldsRef = React.useRef<Set<keyof AddSkillFormValues>>(
    new Set(),
  );

  const handleSelectValue = (
    field: keyof AddSkillFormValues,
    value: string | null,
  ) => {
    if (!value) return;

    selectedFieldsRef.current.add(field);
    setFieldValue(field, value, { shouldValidate: true });
  };

  const handleSelectOpenChange = (
    field: keyof AddSkillFormValues,
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

  const skillItems = skills.map((skill) => ({
    value: skill.name,
    label: skill.name,
  }));

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
          <Select
            items={skillItems}
            value={formData.skillName}
            disabled={skillDisabled}
            onValueChange={(value) => handleSelectValue('skillName', value)}
            onOpenChange={(isOpen) =>
              handleSelectOpenChange('skillName', isOpen)
            }
          >
            <SelectTrigger
              label={t('skills.skill')}
              className="border-[#AEAEAE] bg-secondary"
              error={errors.skillName ? t(errors.skillName) : undefined}
              aria-label={t('skills.skill')}
              aria-invalid={Boolean(errors.skillName)}
            >
              <SelectValue placeholder={t('skills.skill')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {skillItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select
            items={masteryItems}
            value={formData.mastery}
            onValueChange={(value) => handleSelectValue('mastery', value)}
            onOpenChange={(isOpen) => handleSelectOpenChange('mastery', isOpen)}
          >
            <SelectTrigger
              label={t('skills.mastery')}
              className="border-[#AEAEAE] bg-secondary"
              error={errors.mastery ? t(errors.mastery) : undefined}
              aria-label={t('skills.mastery')}
              aria-invalid={Boolean(errors.mastery)}
            >
              <SelectValue placeholder={t('skills.mastery')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {masteryItems.map(({ value, label }) => (
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
