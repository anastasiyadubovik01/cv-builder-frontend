'use client';

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
import type { AddUserSkillFormValues } from '@/lib/validations/skill';

type ChangeUserSkillModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  skillDisabled?: boolean;

  skills: ApiSkill[];
  formData: AddUserSkillFormValues;
  errors: Partial<Record<keyof AddUserSkillFormValues, string>>;

  loading: boolean;
  isValid: boolean;

  setFieldValue: (field: keyof AddUserSkillFormValues, value: string) => void;

  validateField: (field: keyof AddUserSkillFormValues) => boolean;
  handleSubmit: () => Promise<boolean>;
  t: (key: string) => string;
};

const masteryItems: { value: Mastery; label: string }[] = [
  { value: 'Novice', label: 'Novice' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Competent', label: 'Competent' },
  { value: 'Proficient', label: 'Proficient' },
  { value: 'Expert', label: 'Expert' },
];

export function ChangeUserSkillModal({
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
  t,
}: ChangeUserSkillModalProps) {
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
      t={t}
    >
      <div className="flex flex-col gap-9">
        <div>
          <Select
            items={skillItems}
            value={formData.skillName}
            disabled={skillDisabled}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('skillName', value);
              }
            }}
          >
            <SelectTrigger
              label={t('users.skills.skill')}
              className="border-[#AEAEAE] bg-secondary"
              aria-label={t('users.skills.skill')}
              aria-invalid={Boolean(errors.skillName)}
              onBlur={() => validateField('skillName')}
            >
              <SelectValue placeholder={t('users.skills.skill')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {skillItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.skillName && (
            <p className="mt-1 ml-3 text-xs text-destructive">
              {t(errors.skillName)}
            </p>
          )}
        </div>

        <div>
          <Select
            items={masteryItems}
            value={formData.mastery}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('mastery', value);
              }
            }}
          >
            <SelectTrigger
              label={t('users.skills.mastery')}
              className="border-[#AEAEAE] bg-secondary"
              aria-label={t('users.skills.mastery')}
              aria-invalid={Boolean(errors.mastery)}
              onBlur={() => validateField('mastery')}
            >
              <SelectValue placeholder={t('users.skills.mastery')} />
            </SelectTrigger>

            <SelectContent className="bg-secondary">
              {masteryItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.mastery && (
            <p className="mt-1 ml-3 text-xs text-destructive">
              {t(errors.mastery)}
            </p>
          )}
        </div>
      </div>
    </ChangeDialog>
  );
}
