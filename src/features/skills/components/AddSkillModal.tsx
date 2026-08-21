'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import { ChangeSkillModal } from '@/features/skills/components/ChangeSkillModal';
import { useAddUserSkill } from '@/features/skills/hooks/useAddUserSkill';

type AddUserSkillModalProps = {
  userId: string;
  skills: ApiSkill[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function AddSkillModal({
  userId,
  skills,
  trigger,
  onSuccess,
}: AddUserSkillModalProps) {
  const form = useAddUserSkill({
    userId,
    skills,
    onSuccess,
  });

  return (
    <ChangeSkillModal {...form} type="Add" skills={skills} trigger={trigger} />
  );
}
