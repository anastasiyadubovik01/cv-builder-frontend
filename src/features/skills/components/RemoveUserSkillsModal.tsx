'use client';

import { DeleteCountDialog } from '@/components/dialogs/DeleteCountDialog';
import { useRemoveUserSkills } from '@/features/skills/hooks/useRemoveUserSkills';

type RemoveUserSkillsModalProps = {
  userId: string;
  selectedSkills: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function RemoveUserSkillsModal({
  userId,
  selectedSkills,
  open,
  onOpenChange,
  onSuccess,
}: RemoveUserSkillsModalProps) {
  const { handleRemove, loading, t } = useRemoveUserSkills({
    userId,
    onSuccess,
  });

  return (
    <DeleteCountDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('users.skills.removeDialog.title')}
      description={t('users.skills.removeDialog.description', {
        count: selectedSkills.length,
      })}
      confirmDisabled={loading}
      onConfirm={() => handleRemove(selectedSkills)}
      t={t}
    />
  );
}
