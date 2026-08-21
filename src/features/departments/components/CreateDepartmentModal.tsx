'use client';

import type { ReactNode } from 'react';

import type { ApiDepartment } from '@/api/departments';

import { ChangeDepartmentModal } from './ChangeDepartmentModal';
import { useCreateDepartmentForm } from '../hooks/useCreateDepartmentForm';

type CreateDepartmentModalProps = {
  departments: ApiDepartment[];
  trigger?: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateDepartmentModal({
  departments,
  trigger,
  onSuccess,
}: CreateDepartmentModalProps) {
  const form = useCreateDepartmentForm({
    departments,
    onSuccess,
  });

  return <ChangeDepartmentModal {...form} type="Create" trigger={trigger} />;
}
