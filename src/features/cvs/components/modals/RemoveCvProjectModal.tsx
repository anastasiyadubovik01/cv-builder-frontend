'use client';

import React from 'react';
import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';
import { useRemoveCvProject } from '../../hooks/useRemoveCvProject';

export interface DeleteCvProjectModalProps extends Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm' | 't'
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
  const { handleDelete, t } = useRemoveCvProject({ onSuccess });

  const handleConfirm = async (): Promise<boolean> => {
    return await handleDelete(cvId, projectId);
  };

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="CV Project"
      onConfirm={handleConfirm}
      t={t}
    />
  );
}
