import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_PROFILE_LANGUAGE_MUTATION } from '@/api/languages';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import type { Proficiency } from '@/features/languages/types';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  addUserLanguageSchema,
  type AddUserLanguageFormValues,
} from '@/lib/validations/language';

type UseUpdateUserLanguageOptions = {
  userId: string;
  languageName: string;
  proficiency: Proficiency;
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateUserLanguage({
  userId,
  languageName,
  proficiency,
  onSuccess,
}: UseUpdateUserLanguageOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<AddUserLanguageFormValues>({
      initialValues: {
        languageName,
        proficiency,
      },
      schema: addUserLanguageSchema,
    });

  const [updateProfileLanguage, { loading }] = useMutation(
    UPDATE_PROFILE_LANGUAGE_MUTATION,
  );

  const isValid = addUserLanguageSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await updateProfileLanguage({
        variables: {
          language: {
            userId,
            name: languageName,
            proficiency: formData.proficiency as Proficiency,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('users.languages.updateSuccess'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update user language',
      });

      return false;
    }
  };

  return {
    formData,
    errors,
    loading,
    isValid,
    setFieldValue,
    validateField,
    handleSubmit,
    t,
  };
}
