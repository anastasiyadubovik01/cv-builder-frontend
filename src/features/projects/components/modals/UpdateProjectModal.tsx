'use client';

import React from 'react';
import { ChangeProjectModal } from './ChangeProjectModal';
import { useUpdateProjectForm } from '../../hooks/useUpdateProjectForm';
import type { Project } from '../../types';

type UpdateProjectModalProps = {
  project: Project;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateProjectModal({
  project,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: UpdateProjectModalProps) {
  const form = useUpdateProjectForm({ project, onSuccess });

  return (
    <ChangeProjectModal
      {...form}
      type="Update"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
