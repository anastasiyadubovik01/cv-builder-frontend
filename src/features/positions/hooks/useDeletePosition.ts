import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_POSITION_MUTATION } from '@/api/positions';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseDeletePositionOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeletePosition({
  onSuccess,
}: UseDeletePositionOptions = {}) {
  const { t } = useTranslation();
  const toast = useToast();

  const [deletePosition, { loading }] = useMutation(DELETE_POSITION_MUTATION);

  const handleDelete = async (positionId: string): Promise<boolean> => {
    try {
      const result = await deletePosition({
        variables: {
          position: {
            positionId,
          },
        },
      });

      const isSuccess = Boolean(result.data?.deletePosition.affected);

      if (!isSuccess) {
        return false;
      }

      toast.success(t('positions.notifications.deleteSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Delete Position',
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
