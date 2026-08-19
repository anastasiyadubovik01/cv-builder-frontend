import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { DELETE_PROFILE_LANGUAGE_MUTATION } from '@/api/languages';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

type UseRemoveUserLanguagesOptions = {
  userId: string;
  onSuccess?: () => void | Promise<void>;
};

export function useRemoveUserLanguages({
  userId,
  onSuccess,
}: UseRemoveUserLanguagesOptions) {
  const { t } = useTranslation();

  const [deleteProfileLanguage, { loading }] = useMutation(
    DELETE_PROFILE_LANGUAGE_MUTATION,
  );

  const handleRemove = async (names: string[]): Promise<boolean> => {
    if (names.length === 0) {
      return false;
    }

    try {
      await deleteProfileLanguage({
        variables: {
          language: {
            userId,
            name: names,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('users.languages.removeSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Remove user languages',
      });

      return false;
    }
  };

  return {
    handleRemove,
    loading,
    t,
  };
}
