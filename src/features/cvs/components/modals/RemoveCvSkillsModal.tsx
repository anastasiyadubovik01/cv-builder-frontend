'use client';

import { DeleteCountDialog } from '@/components/dialogs/DeleteCountDialog';
import { useRemoveCvSkills } from '@/features/cvs/hooks/useRemoveCvSkills';

type RemoveCvSkillsModalProps = {
  cvId: string;
  selectedSkills: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function RemoveCvSkillsModal({
  cvId,
  selectedSkills,
  open,
  onOpenChange,
  onSuccess,
}: RemoveCvSkillsModalProps) {
  const { handleRemove, loading, t } = useRemoveCvSkills({
    cvId,
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
