import {
  ChangeUserModal,
  type ChangeUserModalProps,
} from '@/features/users/components/ChangeUserModal';

type CreateUserModalProps = Omit<ChangeUserModalProps, 'type'>;

export function CreateUserModal(props: CreateUserModalProps) {
  return <ChangeUserModal {...props} type="Create" />;
}
