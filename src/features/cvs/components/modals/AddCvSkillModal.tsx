'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import { ChangeSkillModal } from '@/features/skills/components/ChangeSkillModal';
import { useAddCvSkill } from '@/features/skills/hooks/useAddCvSkill';

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
    <ChangeSkillModal {...form} type="Add" skills={skills} trigger={trigger} />
  );
}
