'use client';

import {
  ChangeUserModal,
  type ChangeUserModalProps,
} from '@/features/users/components/modals/ChangeUserModal';
import { useCreateUserForm } from '@/features/users/hooks/useCreateUserForm';

type CreateUserModalProps = {
  trigger: ChangeUserModalProps['trigger'];
  onSuccess?: () => void | Promise<void>;
};

export function CreateUserModal({ trigger, onSuccess }: CreateUserModalProps) {
  const form = useCreateUserForm({ onSuccess });

  return <ChangeUserModal {...form} type="Create" trigger={trigger} />;
}
