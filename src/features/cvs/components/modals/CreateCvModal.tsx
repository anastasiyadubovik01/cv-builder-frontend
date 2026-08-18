'use client';

import React from 'react';
import { ChangeCvModal } from '@/features/cvs/components/modals/ChangeCvModal';
import { useCreateCvForm } from '@/features/cvs/hooks/useCreateCvForm';

type CreateCvModalProps = {
  userId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateCvModal({
  userId,
  trigger,
  onSuccess,
}: CreateCvModalProps) {
  const form = useCreateCvForm({ userId, onSuccess });
  return <ChangeCvModal {...form} type="Create" trigger={trigger} />;
}
