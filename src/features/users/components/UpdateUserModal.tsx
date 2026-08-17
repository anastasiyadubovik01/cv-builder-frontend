'use client';

import { useQuery } from '@apollo/client/react';

import { USER_QUERY, type ApiUserDetails } from '@/api/users';
import { ChangeUserModal } from '@/features/users/components/ChangeUserModal';
import { useUpdateUserForm } from '@/features/users/hooks/useUpdateUserForm';
import type { UpdateUserFormValues } from '@/lib/validations/user';

type UpdateUserModalProps = {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateUserModal({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: UpdateUserModalProps) {
  const { data } = useQuery(USER_QUERY, {
    variables: {
      userId,
    },
    skip: !open,
  });

  if (!data?.user) {
    return null;
  }

  return (
    <UpdateUserForm
      user={data.user}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    />
  );
}

type UpdateUserFormProps = {
  user: ApiUserDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

function UpdateUserForm({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UpdateUserFormProps) {
  const initialValues: UpdateUserFormValues = {
    email: user.email,
    password: '',
    firstName: user.profile.first_name ?? '',
    lastName: user.profile.last_name ?? '',
    departmentId: user.department?.id ?? '',
    positionId: user.position?.id ?? '',
    role: user.role as 'Employee' | 'Admin',
  };

  const form = useUpdateUserForm({
    userId: user.id,
    initialValues,
    onSuccess,
  });

  return (
    <ChangeUserModal
      {...form}
      type="Update"
      open={open}
      onOpenChange={onOpenChange}
      authDisabled
    />
  );
}
