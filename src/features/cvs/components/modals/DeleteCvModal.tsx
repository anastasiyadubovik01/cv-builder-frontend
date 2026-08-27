'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useDeleteCv } from '@/features/cvs/hooks/useDeleteCv';

export interface DeleteCvModalProps extends Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm'
> {
  cvId: string;
  onSuccess?: () => void | Promise<void>;
}

export function DeleteCvModal({
  cvId,
  name,
  onSuccess,
  ...props
}: DeleteCvModalProps) {
  const { handleDelete } = useDeleteCv();

  const handleConfirm = async (): Promise<boolean> => {
    const success = await handleDelete(cvId);
    if (success) {
      await onSuccess?.();
    }
    return success;
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="CV"
      onConfirm={handleConfirm}
    />
  );
}
