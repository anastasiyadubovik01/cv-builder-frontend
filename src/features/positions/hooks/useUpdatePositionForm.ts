import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_POSITION_MUTATION, type Position } from '@/api/positions';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminPositionSchema,
  type AdminPositionFormValues,
} from '@/lib/validations/admin-position';

type UseUpdatePositionFormOptions = {
  position: Position;
  positions: Position[];
  onSuccess?: () => void | Promise<void>;
};

export function useUpdatePositionForm({
  position,
  positions,
  onSuccess,
}: UseUpdatePositionFormOptions) {
  const { t } = useTranslation();

  const initialValues: AdminPositionFormValues = {
    name: position.name,
  };

  const { formData, errors, validateForm, handleChange, clearErrors } =
    useValidatedForm<AdminPositionFormValues>({
      initialValues,
      schema: adminPositionSchema,
    });

  const [updatePosition, { loading }] = useMutation(UPDATE_POSITION_MUTATION);

  const normalizedName = formData.name.trim().toLowerCase();

  const duplicateName =
    normalizedName.length > 0 &&
    positions.some(
      (item) =>
        item.id !== position.id &&
        item.name.trim().toLowerCase() === normalizedName,
    );

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || duplicateName) {
      return false;
    }

    try {
      await updatePosition({
        variables: {
          position: {
            positionId: position.id,
            name: formData.name.trim(),
          },
        },
      });

      clearErrors();

      toast.success(t('positions.notifications.updateSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update Position',
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
