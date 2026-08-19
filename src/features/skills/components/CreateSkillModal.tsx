'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import {
  ChangeSkillModal,
  type SkillFormCategory,
} from '@/features/skills/components/ChangeSkillModal';
import { useCreateSkillForm } from '@/features/skills/hooks/useCreateSkillForm';

type CreateSkillModalProps = {
  skills: ApiSkill[];
  categories: SkillFormCategory[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateSkillModal({
  skills,
  categories,
  trigger,
  onSuccess,
}: CreateSkillModalProps) {
  const form = useCreateSkillForm({
    skills,
    onSuccess,
  });

  return (
    <ChangeSkillModal
      {...form}
      type="Create"
      categories={categories}
      trigger={trigger}
    />
  );
}
