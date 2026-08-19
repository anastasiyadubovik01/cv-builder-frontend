'use client';

import React from 'react';
import { ChangeProjectModal } from './ChangeProjectModal';
import { useCreateProjectForm } from '../../hooks/useCreateProjectForm';

type CreateProjectModalProps = {
  trigger?: React.ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateProjectModal({
  trigger,
  onSuccess,
}: CreateProjectModalProps) {
  const form = useCreateProjectForm({ onSuccess });

  return <ChangeProjectModal {...form} type="Create" trigger={trigger} />;
}
