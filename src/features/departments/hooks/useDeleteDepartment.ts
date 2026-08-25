import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_DEPARTMENT_MUTATION } from '@/api/departments';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseDeleteDepartmentOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteDepartment({
  onSuccess,
}: UseDeleteDepartmentOptions = {}) {
  const { t } = useTranslation();
  const toast = useToast();

  const [deleteDepartment, { loading }] = useMutation(
    DELETE_DEPARTMENT_MUTATION,
  );

  const handleDelete = async (departmentId: string): Promise<boolean> => {
    try {
      const result = await deleteDepartment({
        variables: {
          department: {
            departmentId,
          },
        },
      });

      const isSuccess = Boolean(result.data?.deleteDepartment.affected);

      if (!isSuccess) {
        return false;
      }

      toast.success(t('departments.notifications.deleteSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Delete Department',
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
