'use client';

import { DeleteCountDialog } from '@/components/dialogs/DeleteCountDialog';
import { useRemoveUserLanguages } from '@/features/languages/hooks/useRemoveUserLanguages';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { handleRemove, loading } = useRemoveUserLanguages({
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
    />
  );
}
