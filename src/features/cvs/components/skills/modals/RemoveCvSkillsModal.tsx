'use client';

import { DeleteCountDialog } from '@/components/dialogs/DeleteCountDialog';
import { useRemoveCvSkills } from '@/features/cvs/components/skills/hooks/useRemoveCvSkills';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { handleRemove, loading } = useRemoveCvSkills({
    cvId,
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
