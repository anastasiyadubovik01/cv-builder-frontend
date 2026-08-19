'use client';

import type { ReactNode } from 'react';

import type { ApiSkill } from '@/api/skills';
import { ChangeUserSkillModal } from '@/features/skills/components/ChangeUserSkillModal';
import { useAddUserSkill } from '@/features/skills/hooks/useAddUserSkill';

type AddUserSkillModalProps = {
  userId: string;
  skills: ApiSkill[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function AddUserSkillModal({
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
    <ChangeUserSkillModal
      {...form}
      type="Add"
      skills={skills}
      trigger={trigger}
    />
  );
}
