'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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

  const handleConfirm = async () => {
    const success = await handleRemove(selectedLanguages);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('users.languages.removeDialog.title')}
          </AlertDialogTitle>

          <AlertDialogDescription className="font-regular text-foreground">
            {t('users.languages.removeDialog.description', {
              count: selectedLanguages.length,
            })}
          </AlertDialogDescription>

          <AlertDialogCloseButton />
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('dialogs.common.cancel')}</AlertDialogCancel>

          <AlertDialogAction
            disabled={loading}
            onClick={() => void handleConfirm()}
          >
            {t('dialogs.common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
