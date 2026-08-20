import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { CREATE_LANGUAGE_MUTATION, type ApiLanguage } from '@/api/languages';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminLanguageSchema,
  type AdminLanguageFormValues,
} from '@/lib/validations/admin-language';

const INITIAL_VALUES: AdminLanguageFormValues = {
  name: '',
  iso2: '',
  nativeName: '',
};

type UseCreateLanguageFormOptions = {
  languages: ApiLanguage[];
  onSuccess?: () => void | Promise<void>;
};

export function useCreateLanguageForm({
  languages,
  onSuccess,
}: UseCreateLanguageFormOptions) {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<AdminLanguageFormValues>({
    initialValues: INITIAL_VALUES,
    schema: adminLanguageSchema,
  });

  const [createLanguage, { loading }] = useMutation(CREATE_LANGUAGE_MUTATION);

  const normalizedName = formData.name.trim().toLowerCase();
  const normalizedIso = formData.iso2.trim().toUpperCase();

  const duplicateName =
    normalizedName.length > 0 &&
    languages.some(
      (language) => language.name.trim().toLowerCase() === normalizedName,
    );

  const duplicateIso =
    normalizedIso.length > 0 &&
    languages.some(
      (language) => language.iso2.trim().toUpperCase() === normalizedIso,
    );

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || duplicateName || duplicateIso) {
      return false;
    }

    try {
      await createLanguage({
        variables: {
          language: {
            name: formData.name.trim(),
            iso2: normalizedIso,
            native_name: formData.nativeName.trim(),
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      toast.success(t('languages.admin.notifications.createSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Create Language',
      });

      return false;
    }
  };

  return {
    formData,
    errors,
    loading,
    duplicateName,
    duplicateIso,
    handleChange,
    handleSubmit,
    t,
  };
}
