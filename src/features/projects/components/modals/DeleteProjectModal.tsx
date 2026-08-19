'use client';

import React from 'react';
import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useDeleteProject } from '../../hooks/useDeleteProject';

export interface DeleteProjectModalProps extends Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm' | 't'
> {
  projectId: string;
  onSuccess?: () => void | Promise<void>;
}

export function DeleteProjectModal({
  projectId,
  name,
  onSuccess,
  ...props
}: DeleteProjectModalProps) {
  const { handleDelete, t } = useDeleteProject();

  const handleConfirm = async (): Promise<boolean> => {
    const success = await handleDelete(projectId);
    if (success) {
      await onSuccess?.();
    }
    return success;
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="project"
      onConfirm={handleConfirm}
      t={t}
    />
  );
}
