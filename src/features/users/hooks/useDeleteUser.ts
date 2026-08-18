import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_USER_MUTATION } from '@/api/users';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

export function useDeleteUser() {
  const { t } = useTranslation();
  const [deleteUser, { loading }] = useMutation(DELETE_USER_MUTATION);

  const handleDelete = async (userId: string): Promise<boolean> => {
    try {
      const response = await deleteUser({
        variables: {
          userId,
        },
      });

      const isSuccess = Boolean(response.data?.deleteUser?.affected);

      if (isSuccess) {
        toast.success(
          t('users.notifications.deleteSuccess', 'User successfully deleted'),
        );
      }

      return isSuccess;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Delete user',
      });

      return false;
    }
  };

  return {
    handleDelete,
    loading,
    t,
  };
}
