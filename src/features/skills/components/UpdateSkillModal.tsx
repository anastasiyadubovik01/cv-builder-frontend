'use client';

import type { ApiSkill } from '@/api/skills';
import {
  ChangeSkillModal,
  type SkillFormCategory,
} from '@/features/skills/components/ChangeSkillModal';
import { useUpdateSkillForm } from '@/features/skills/hooks/useUpdateSkillForm';

type UpdateSkillModalProps = {
  skill: ApiSkill;
  skills: ApiSkill[];
  categories: SkillFormCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateSkillModal({
  skill,
  skills,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: UpdateSkillModalProps) {
  const form = useUpdateSkillForm({
    skill,
    skills,
    onSuccess,
  });

  return (
    <ChangeSkillModal
      {...form}
      type="Update"
      categories={categories}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
