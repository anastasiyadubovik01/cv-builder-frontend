import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { ADD_PROFILE_LANGUAGE_MUTATION } from '@/api/languages';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import type { Proficiency } from '@/features/languages/types';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  addUserLanguageSchema,
  type AddUserLanguageFormValues,
} from '@/lib/validations/language';

const INITIAL_VALUES: AddUserLanguageFormValues = {
  languageName: '',
  proficiency: '',
};

type UseAddUserLanguageOptions = {
  userId: string;
  onSuccess?: () => void | Promise<void>;
};

export function useAddUserLanguage({
  userId,
  onSuccess,
}: UseAddUserLanguageOptions) {
  const { t } = useTranslation();

  const { formData, errors, validateForm, validateField, setFieldValue } =
    useValidatedForm<AddUserLanguageFormValues>({
      initialValues: INITIAL_VALUES,
      schema: addUserLanguageSchema,
    });

  const [addProfileLanguage, { loading }] = useMutation(
    ADD_PROFILE_LANGUAGE_MUTATION,
  );

  const isValid = addUserLanguageSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await addProfileLanguage({
        variables: {
          language: {
            userId,
            name: formData.languageName,
            proficiency: formData.proficiency as Proficiency,
          },
        },
      });

      await onSuccess?.();

      toast.success(t('users.languages.addSuccess'));

      setFieldValue('languageName', '');
      setFieldValue('proficiency', '');

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Add user language',
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
