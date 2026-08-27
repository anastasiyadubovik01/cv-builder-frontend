'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';

import { useDeletePosition } from '../hooks/useDeletePosition';

type DeletePositionModalProps = Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm'
> & {
  positionId: string;
  onSuccess?: () => void | Promise<void>;
};

export function DeletePositionModal({
  positionId,
  name,
  onSuccess,
  ...props
}: DeletePositionModalProps) {
  const { handleDelete } = useDeletePosition({
    onSuccess,
  });

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="position"
      onConfirm={() => handleDelete(positionId)}
    />
  );
}
