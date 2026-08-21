'use client';

import type { ApiDepartment } from '@/api/departments';

import { useUpdateDepartmentForm } from '../hooks/useUpdateDepartmentForm';
import { ChangeDepartmentModal } from './ChangeDepartmentModal';

type UpdateDepartmentModalProps = {
  department: ApiDepartment;
  departments: ApiDepartment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateDepartmentModal({
  department,
  departments,
  open,
  onOpenChange,
  onSuccess,
}: UpdateDepartmentModalProps) {
  const form = useUpdateDepartmentForm({
    department,
    departments,
    onSuccess,
  });

  return (
    <ChangeDepartmentModal
      {...form}
      type="Update"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
