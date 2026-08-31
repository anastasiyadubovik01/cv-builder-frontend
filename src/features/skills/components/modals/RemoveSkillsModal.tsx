'use client';

import { DeleteCountDialog } from '@/components/dialogs/DeleteCountDialog';
import { useRemoveUserSkills } from '@/features/skills/hooks/useRemoveUserSkills';
import { useTranslation } from 'react-i18next';

type RemoveUserSkillsModalProps = {
  userId: string;
  selectedSkills: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function RemoveSkillsModal({
  userId,
  selectedSkills,
  open,
  onOpenChange,
  onSuccess,
}: RemoveUserSkillsModalProps) {
  const { t } = useTranslation();
  const { handleRemove, loading } = useRemoveUserSkills({
    userId,
    onSuccess,
  });

  return (
    <DeleteCountDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('skills.removeDialog.title')}
      description={t('skills.removeDialog.description', {
        count: selectedSkills.length,
      })}
      confirmDisabled={loading}
      onConfirm={() => handleRemove(selectedSkills)}
    />
  );
}
