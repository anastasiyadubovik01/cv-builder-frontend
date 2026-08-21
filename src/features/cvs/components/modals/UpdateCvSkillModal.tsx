'use client';

import type { ApiSkill, ProfileSkill } from '@/api/skills';
import { ChangeSkillModal } from '@/features/skills/components/ChangeSkillModal';
import { useUpdateCvSkill } from '@/features/skills/hooks/useUpdateCvSkill';

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
