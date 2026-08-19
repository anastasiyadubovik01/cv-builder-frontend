'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useDeleteSkill } from '@/features/skills/hooks/useDeleteSkill';

type DeleteSkillModalProps = Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm' | 't'
> & {
  skillId: string;
  onSuccess?: () => void | Promise<void>;
};

export function DeleteSkillModal({
  skillId,
  name,
  onSuccess,
  ...props
}: DeleteSkillModalProps) {
  const { handleDelete, t } = useDeleteSkill();

  const handleConfirm = async (): Promise<boolean> => {
    const success = await handleDelete(skillId);

    if (success) {
      await onSuccess?.();
    }

    return success;
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="skill"
      onConfirm={handleConfirm}
      t={t}
    />
  );
}
