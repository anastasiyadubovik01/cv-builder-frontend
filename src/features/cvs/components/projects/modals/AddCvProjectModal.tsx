'use client';

import React from 'react';
import { ChangeCvProjectModal } from './ChangeCvProjectModal';
import { useAddCvProjectForm } from '../hooks/useAddCvProjectForm';

type CreateCvProjectModalProps = {
  cvId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function AddCvProjectModal({
  cvId,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: CreateCvProjectModalProps) {
  const form = useAddCvProjectForm({ cvId, onSuccess });

  return (
    <ChangeCvProjectModal
      {...form}
      type="Add"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
