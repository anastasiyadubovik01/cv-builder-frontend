'use client';

import React from 'react';
import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useDeleteProject } from '../../hooks/useDeleteProject';

export interface DeleteProjectModalProps extends Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm'
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
  const { handleDelete } = useDeleteProject({ onSuccess });

  const handleConfirm = async (): Promise<boolean> => {
    return await handleDelete(projectId);
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="project"
      onConfirm={handleConfirm}
    />
  );
}
