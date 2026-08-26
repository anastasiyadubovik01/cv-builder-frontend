'use client';

import React from 'react';
import type { ApiCvProject } from '@/api/cv-projects';
import { ChangeCvProjectModal } from '../../modals/ChangeCvProjectModal';
import { useUpdateCvProjectForm } from '@/features/cvs/components/projects/hooks/useUpdateCvProjectForm';

type UpdateCvProjectModalProps = {
  cvId: string;
  project: ApiCvProject;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateCvProjectModal({
  cvId,
  project,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: UpdateCvProjectModalProps) {
  const form = useUpdateCvProjectForm({ cvId, project, onSuccess });

  return (
    <ChangeCvProjectModal
      {...form}
      type="Update"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
