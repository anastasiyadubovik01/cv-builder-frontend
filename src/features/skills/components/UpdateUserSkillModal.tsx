'use client';

import type { ApiSkill, ProfileSkill } from '@/api/skills';
import { ChangeUserSkillModal } from '@/features/skills/components/ChangeUserSkillModal';
import { useUpdateUserSkill } from '@/features/skills/hooks/useUpdateUserSkill';

type UpdateUserSkillModalProps = {
  userId: string;
  skill: ProfileSkill;
  skills: ApiSkill[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateUserSkillModal({
  userId,
  skill,
  skills,
  open,
  onOpenChange,
  onSuccess,
}: UpdateUserSkillModalProps) {
  const form = useUpdateUserSkill({
    userId,
    skillName: skill.name,
    categoryId: skill.categoryId,
    mastery: skill.mastery,
    onSuccess,
  });

  return (
    <ChangeUserSkillModal
      {...form}
      type="Update"
      skills={skills}
      open={open}
      onOpenChange={onOpenChange}
      skillDisabled
    />
  );
}
