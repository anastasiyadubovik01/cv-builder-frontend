'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useDeleteUser } from '@/features/users/hooks/useDeleteUser';

type DeleteUserModalProps = Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm'
> & {
  userId: string;
  onSuccess?: () => void;
};

export function DeleteUserModal({
  userId,
  name,
  onSuccess,
  ...props
}: DeleteUserModalProps) {
  const { handleDelete } = useDeleteUser();

  const handleConfirm = async (): Promise<boolean> => {
    const success = await handleDelete(userId);

    if (success) {
      onSuccess?.();
    }

    return success;
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="user"
      onConfirm={handleConfirm}
    />
  );
}
