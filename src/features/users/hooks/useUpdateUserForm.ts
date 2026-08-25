import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import { UPDATE_PROFILE_MUTATION, UPDATE_USER_MUTATION } from '@/api/users';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { useUserCatalogs } from '@/features/users/hooks/useUserCatalogs';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from '@/lib/validations/user';

type UseUpdateUserFormOptions = {
  userId: string;
  initialValues: UpdateUserFormValues;
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateUserForm({
  userId,
  initialValues,
  onSuccess,
}: UseUpdateUserFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const {
    formData,
    errors,
    validateForm,
    validateField,
    setFieldValue,
    handleChange,
    clearErrors,
  } = useValidatedForm<UpdateUserFormValues>({
    initialValues,
    schema: updateUserSchema,
  });

  const { departments, positions } = useUserCatalogs();

  const [updateProfile, { loading: profileLoading }] = useMutation(
    UPDATE_PROFILE_MUTATION,
  );

  const [updateUser, { loading: userLoading }] =
    useMutation(UPDATE_USER_MUTATION);

  const isValid = updateUserSchema.safeParse(formData).success;
  const loading = profileLoading || userLoading;

  const trimmedFirstName = formData.firstName.trim();
  const trimmedLastName = formData.lastName.trim();

  const namesChanged =
    trimmedFirstName !== initialValues.firstName.trim() ||
    trimmedLastName !== initialValues.lastName.trim();

  const userChanged =
    formData.departmentId !== initialValues.departmentId ||
    formData.positionId !== initialValues.positionId ||
    formData.role !== initialValues.role;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      if (namesChanged) {
        await updateProfile({
          variables: {
            profile: {
              userId,
              first_name: trimmedFirstName,
              last_name: trimmedLastName,
            },
          },
        });
      }

      if (userChanged) {
        await updateUser({
          variables: {
            user: {
              userId,
              departmentId: formData.departmentId,
              positionId: formData.positionId,
              role: formData.role,
            },
          },
        });
      }

      clearErrors();

      await onSuccess?.();

      toast.success(t('users.update.success'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update user',
      });

      return false;
    }
  };

  return {
    formData,
    errors,
    departments,
    positions,
    loading,
    isValid,
    handleChange,
    setFieldValue,
    validateField,
    handleSubmit,
    t,
  };
}
