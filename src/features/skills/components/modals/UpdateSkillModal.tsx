'use client';

import type { ApiSkill, ProfileSkill } from '@/api/skills';
import { ChangeSkillModal } from '@/features/skills/components/modals/ChangeSkillModal';
import { useUpdateUserSkill } from '@/features/skills/hooks/useUpdateUserSkill';

type UpdateSkillModalProps = {
  userId: string;
  skill: ProfileSkill;
  skills: ApiSkill[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateSkillModal({
  userId,
  skill,
  skills,
  open,
  onOpenChange,
  onSuccess,
}: UpdateSkillModalProps) {
  const form = useUpdateUserSkill({
    userId,
    skillName: skill.name,
    categoryId: skill.categoryId,
    mastery: skill.mastery,
    onSuccess,
  });

  return (
    <ChangeSkillModal
      {...form}
      type="Update"
      skills={skills}
      open={open}
      onOpenChange={onOpenChange}
      skillDisabled
    />
  );
}
