'use client';

import React from 'react';
import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useRemoveCvProject } from '../hooks/useRemoveCvProject';

export interface DeleteCvProjectModalProps extends Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm'
> {
  cvId: string;
  projectId: string;
  onSuccess?: () => void | Promise<void>;
}

export function RemoveCvProjectModal({
  cvId,
  projectId,
  name,
  onSuccess,
  ...props
}: DeleteCvProjectModalProps) {
  const { handleDelete } = useRemoveCvProject({ onSuccess });

  const handleConfirm = async (): Promise<boolean> => {
    return await handleDelete(cvId, projectId);
  };

  return (
    <DeleteDialog
      {...props}
      actionTitle="Remove"
      name={name}
      itemType="CV Project"
      onConfirm={handleConfirm}
    />
  );
}
