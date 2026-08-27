import { DELETE_USER_MUTATION } from '@/api/users';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type DeleteUserData = {
  deleteUser: { affected: number };
};

type DeleteUserVars = {
  userId: string;
};

type UseDeleteUserOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteUser({ onSuccess }: UseDeleteUserOptions = {}) {
  const { handleDelete, loading } = useDeleteEntity<
    DeleteUserData,
    DeleteUserVars,
    [userId: string]
  >({
    mutation: DELETE_USER_MUTATION,
    successMessageKey: 'users.notifications.deleteSuccess',
    defaultSuccessMessage: 'User successfully deleted',
    errorContext: 'Delete user',
    buildVariables: (userId) => ({ userId }),
    isSuccessCheck: (data) => Boolean(data?.deleteUser?.affected),
    onSuccess,
  });

  return { handleDelete, loading };
}
