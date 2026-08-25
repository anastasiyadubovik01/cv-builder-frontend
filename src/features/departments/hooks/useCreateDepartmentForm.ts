import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import {
  CREATE_DEPARTMENT_MUTATION,
  type ApiDepartment,
} from '@/api/departments';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminDepartmentSchema,
  type AdminDepartmentFormValues,
} from '@/lib/validations/admin-department';

const INITIAL_VALUES: AdminDepartmentFormValues = {
  name: '',
};

type UseCreateDepartmentFormOptions = {
  departments: ApiDepartment[];
  onSuccess?: () => void | Promise<void>;
};

export function useCreateDepartmentForm({
  departments,
  onSuccess,
}: UseCreateDepartmentFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const {
    formData,
    errors,
    validateForm,
    handleChange,
    setFormData,
    clearErrors,
  } = useValidatedForm<AdminDepartmentFormValues>({
    initialValues: INITIAL_VALUES,
    schema: adminDepartmentSchema,
  });

  const [createDepartment, { loading }] = useMutation(
    CREATE_DEPARTMENT_MUTATION,
  );

  const normalizedName = formData.name.trim().toLowerCase();

  const duplicateName =
    normalizedName.length > 0 &&
    departments.some(
      (department) => department.name.trim().toLowerCase() === normalizedName,
    );

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || duplicateName) {
      return false;
    }

    try {
      await createDepartment({
        variables: {
          department: {
            name: formData.name.trim(),
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      toast.success(t('departments.notifications.createSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Create Department',
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
