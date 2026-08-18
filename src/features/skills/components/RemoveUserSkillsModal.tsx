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

  const handleConfirm = async () => {
    const success = await handleRemove(selectedSkills);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('users.skills.removeDialog.title')}
          </AlertDialogTitle>

          <AlertDialogDescription className="font-regular text-foreground">
            {t('users.skills.removeDialog.description', {
              count: selectedSkills.length,
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
