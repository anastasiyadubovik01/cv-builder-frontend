import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { CREATE_POSITION_MUTATION, type Position } from '@/api/positions';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminPositionSchema,
  type AdminPositionFormValues,
} from '@/lib/validations/admin-position';

const INITIAL_VALUES: AdminPositionFormValues = {
  name: '',
};

type UseCreatePositionFormOptions = {
  positions: Position[];
  onSuccess?: () => void | Promise<void>;
};

export function useCreatePositionForm({
  positions,
  onSuccess,
}: UseCreatePositionFormOptions) {
  const { t } = useTranslation();

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<AdminPositionFormValues>({
    initialValues: INITIAL_VALUES,
    schema: adminPositionSchema,
  });

  const [createPosition, { loading }] = useMutation(CREATE_POSITION_MUTATION);

  const normalizedName = formData.name.trim().toLowerCase();

  const duplicateName =
    normalizedName.length > 0 &&
    positions.some(
      (position) => position.name.trim().toLowerCase() === normalizedName,
    );

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || duplicateName) {
      return false;
    }

    try {
      await createPosition({
        variables: {
          position: {
            name: formData.name.trim(),
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      toast.success(t('positions.notifications.createSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Create Position',
      });

      return false;
    }
  };

  return {
    formData,
    errors,
    loading,
    duplicateName,
    handleChange,
    handleSubmit,
    t,
  };
}
