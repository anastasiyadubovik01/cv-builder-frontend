'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';

import { useDeleteDepartment } from '../../hooks/useDeleteDepartment';

type DeleteDepartmentModalProps = Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm'
> & {
  departmentId: string;
  onSuccess?: () => void | Promise<void>;
};

export function DeleteDepartmentModal({
  departmentId,
  name,
  onSuccess,
  ...props
}: DeleteDepartmentModalProps) {
  const { handleDelete } = useDeleteDepartment({
    onSuccess,
  });

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="department"
      onConfirm={() => handleDelete(departmentId)}
    />
  );
}
