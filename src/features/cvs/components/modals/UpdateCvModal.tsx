'use client';

import React from 'react';
import { ChangeCvModal } from '@/features/cvs/components/modals/ChangeCvModal';
import { useUpdateCvForm } from '@/features/cvs/hooks/useUpdateCvForm';
import type { CreateCvFormValues } from '@/lib/validations/cv';

type UpdateCvModalProps = {
  cvId: string;
  initialValues: CreateCvFormValues;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateCvModal({
  cvId,
  initialValues,
  open,
  onOpenChange,
  onSuccess,
}: UpdateCvModalProps) {
  const form = useUpdateCvForm({
    cvId,
    initialValues,
    onSuccess,
  });

  return (
    <ChangeCvModal
      {...form}
      type="Update"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
