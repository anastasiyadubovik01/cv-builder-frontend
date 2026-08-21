'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import {
  ChangeSkillAdminModal,
  type SkillFormCategory,
} from '@/features/skills/components/ChangeSkillAdminModal';
import { useCreateSkillForm } from '@/features/skills/hooks/useCreateSkillForm';

type CreateSkillModalProps = {
  skills: ApiSkill[];
  categories: SkillFormCategory[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateSkillAdminModal({
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
    <ChangeSkillAdminModal
      {...form}
      type="Create"
      categories={categories}
      trigger={trigger}
    />
  );
}
