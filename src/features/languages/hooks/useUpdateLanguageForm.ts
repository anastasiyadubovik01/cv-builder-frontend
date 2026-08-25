import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_LANGUAGE_MUTATION, type ApiLanguage } from '@/api/languages';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminLanguageSchema,
  type AdminLanguageFormValues,
} from '@/lib/validations/admin-language';

type UseUpdateLanguageFormOptions = {
  language: ApiLanguage;
  languages: ApiLanguage[];
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateLanguageForm({
  language,
  languages,
  onSuccess,
}: UseUpdateLanguageFormOptions) {
  const { t } = useTranslation();

  const initialValues: AdminLanguageFormValues = {
    name: language.name,
    iso2: language.iso2,
    nativeName: language.native_name ?? '',
  };

  const { formData, errors, validateForm, handleChange, clearErrors } =
    useValidatedForm<AdminLanguageFormValues>({
      initialValues,
      schema: adminLanguageSchema,
    });

  const [updateLanguage, { loading }] = useMutation(UPDATE_LANGUAGE_MUTATION);

  const normalizedName = formData.name.trim().toLowerCase();
  const normalizedIso = formData.iso2.trim().toUpperCase();

  const duplicateName =
    normalizedName.length > 0 &&
    languages.some(
      (item) =>
        item.id !== language.id &&
        item.name.trim().toLowerCase() === normalizedName,
    );

  const duplicateIso =
    normalizedIso.length > 0 &&
    languages.some(
      (item) =>
        item.id !== language.id &&
        item.iso2.trim().toUpperCase() === normalizedIso,
    );

  const isValid =
    adminLanguageSchema.safeParse(formData).success &&
    !duplicateName &&
    !duplicateIso;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || duplicateName || duplicateIso) {
      return false;
    }

    try {
      await updateLanguage({
        variables: {
          language: {
            languageId: language.id,
            name: formData.name.trim(),
            iso2: normalizedIso,
            native_name: formData.nativeName.trim(),
          },
        },
      });

      clearErrors();

      toast.success(t('languages.admin.notifications.updateSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update Language',
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
    isValid,
  };
}
