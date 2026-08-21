'use client';

import type { ApiSkill, ProfileSkill } from '@/api/skills';
import { ChangeUserSkillModal } from '@/features/skills/components/ChangeUserSkillModal';
import { useUpdateCvSkill } from '@/features/cvs/hooks/useUpdateCvSkill';

type UpdateCvSkillModalProps = {
  cvId: string;
  skill: ProfileSkill;
  skills: ApiSkill[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateCvSkillModal({
  cvId,
  skill,
  skills,
  open,
  onOpenChange,
  onSuccess,
}: UpdateCvSkillModalProps) {
  const form = useUpdateCvSkill({
    cvId,
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
