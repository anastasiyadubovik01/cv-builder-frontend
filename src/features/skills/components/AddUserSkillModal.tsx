'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import type { Mastery } from '@/features/skills/types';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddUserSkill } from '@/features/skills/hooks/useAddUserSkill';

type AddUserSkillModalProps = {
  userId: string;
  skills: ApiSkill[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

const masteryItems: { value: Mastery; label: string }[] = [
  { value: 'Novice', label: 'Novice' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Competent', label: 'Competent' },
  { value: 'Proficient', label: 'Proficient' },
  { value: 'Expert', label: 'Expert' },
];

export function AddUserSkillModal({
  userId,
  skills,
  trigger,
  onSuccess,
}: AddUserSkillModalProps) {
  const {
    formData,
    errors,
    loading,
    isValid,
    setFieldValue,
    validateField,
    handleSubmit,
    t,
  } = useAddUserSkill({
    userId,
    skills,
    onSuccess,
  });

  const skillItems = skills.map((skill) => ({
    value: skill.name,
    label: skill.name,
  }));

  return (
    <ChangeDialog
      actionTitle="Add"
      itemType="skill"
      trigger={trigger}
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
            onValueChange={(value) => {
              if (value) {
                setFieldValue('skillName', value);
              }
            }}
          >
            <SelectTrigger
              label={t('users.skills.skill')}
              aria-label={t('users.skills.skill')}
              aria-invalid={Boolean(errors.skillName)}
              onBlur={() => validateField('skillName')}
              className="border-[#AEAEAE] bg-secondary"
            >
              <SelectValue placeholder={t('users.skills.skill')} />
            </SelectTrigger>

            <SelectContent>
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
              aria-label={t('users.skills.mastery')}
              aria-invalid={Boolean(errors.mastery)}
              onBlur={() => validateField('mastery')}
              className="border-[#AEAEAE] bg-secondary"
            >
              <SelectValue placeholder={t('users.skills.mastery')} />
            </SelectTrigger>

            <SelectContent>
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
