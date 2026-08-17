'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useDeleteCv } from '@/features/cvs/hooks/useDeleteCv';

export interface DeleteCvModalProps extends Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm' | 't'
> {
  cvId: string;
  onSuccess?: () => void;
}

export function DeleteCvModal({
  cvId,
  name,
  onSuccess,
  ...props
}: DeleteCvModalProps) {
  const { handleDelete, t } = useDeleteCv();

  const handleConfirm = async (): Promise<boolean> => {
    const success = await handleDelete(cvId);
    if (success) {
      onSuccess?.();
    }
    return success;
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="CV"
      onConfirm={handleConfirm}
      t={t}
    />
  );
}
