'use client';

import type { ApiSkill } from '@/api/skills';
import {
  ChangeSkillAdminModal,
  type SkillFormCategory,
} from '@/features/skills/components/ChangeSkillAdminModal';
import { useUpdateSkillForm } from '@/features/skills/hooks/useUpdateSkillForm';

type UpdateSkillModalProps = {
  skill: ApiSkill;
  skills: ApiSkill[];
  categories: SkillFormCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateSkillAdminModal({
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
    <ChangeSkillAdminModal
      {...form}
      type="Update"
      categories={categories}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
