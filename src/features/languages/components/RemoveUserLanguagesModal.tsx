'use client';

import { DeleteCountDialog } from '@/components/dialogs/DeleteCountDialog';
import { useRemoveUserLanguages } from '@/features/languages/hooks/useRemoveUserLanguages';

type RemoveUserLanguagesModalProps = {
  userId: string;
  selectedLanguages: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function RemoveUserLanguagesModal({
  userId,
  selectedLanguages,
  open,
  onOpenChange,
  onSuccess,
}: RemoveUserLanguagesModalProps) {
  const { handleRemove, loading, t } = useRemoveUserLanguages({
    userId,
    onSuccess,
  });

  return (
    <DeleteCountDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('users.languages.removeDialog.title')}
      description={t('users.languages.removeDialog.description', {
        count: selectedLanguages.length,
      })}
      confirmDisabled={loading}
      onConfirm={() => handleRemove(selectedLanguages)}
      t={t}
    />
  );
}
