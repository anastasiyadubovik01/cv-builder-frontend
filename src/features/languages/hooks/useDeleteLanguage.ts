import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_LANGUAGE_MUTATION } from '@/api/languages';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseDeleteLanguageOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteLanguage({
  onSuccess,
}: UseDeleteLanguageOptions = {}) {
  const { t } = useTranslation();

  const [deleteLanguage, { loading }] = useMutation(DELETE_LANGUAGE_MUTATION);

  const handleDelete = async (languageId: string): Promise<boolean> => {
    try {
      const result = await deleteLanguage({
        variables: {
          language: {
            languageId,
          },
        },
      });

      const isSuccess = Boolean(result.data?.deleteLanguage.affected);

      if (!isSuccess) {
        return false;
      }

      toast.success(t('languages.admin.notifications.deleteSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Delete Language',
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
