'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import { ChangeUserSkillModal } from '@/features/skills/components/ChangeUserSkillModal';
import { useAddCvSkill } from '@/features/cvs/hooks/useAddCvSkill';

type AddCvSkillModalProps = {
  cvId: string;
  skills: ApiSkill[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function AddCvSkillModal({
  cvId,
  skills,
  trigger,
  onSuccess,
}: AddCvSkillModalProps) {
  const form = useAddCvSkill({
    cvId,
    skills,
    onSuccess,
  });

  return (
    <ChangeUserSkillModal
      {...form}
      type="Add"
      skills={skills}
      trigger={trigger}
    />
  );
}
