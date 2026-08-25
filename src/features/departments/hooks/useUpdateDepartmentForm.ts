import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';

import {
  UPDATE_DEPARTMENT_MUTATION,
  type ApiDepartment,
} from '@/api/departments';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';
import {
  adminDepartmentSchema,
  type AdminDepartmentFormValues,
} from '@/lib/validations/admin-department';

type UseUpdateDepartmentFormOptions = {
  department: ApiDepartment;
  departments: ApiDepartment[];
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateDepartmentForm({
  department,
  departments,
  onSuccess,
}: UseUpdateDepartmentFormOptions) {
  const { t } = useTranslation();
  const toast = useToast();

  const initialValues: AdminDepartmentFormValues = {
    name: department.name,
  };

  const { formData, errors, validateForm, handleChange, clearErrors } =
    useValidatedForm<AdminDepartmentFormValues>({
      initialValues,
      schema: adminDepartmentSchema,
    });

  const [updateDepartment, { loading }] = useMutation(
    UPDATE_DEPARTMENT_MUTATION,
  );

  const normalizedName = formData.name.trim().toLowerCase();

  const duplicateName =
    normalizedName.length > 0 &&
    departments.some(
      (item) =>
        item.id !== department.id &&
        item.name.trim().toLowerCase() === normalizedName,
    );

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm() || duplicateName) {
      return false;
    }

    try {
      await updateDepartment({
        variables: {
          department: {
            departmentId: department.id,
            name: formData.name.trim(),
          },
        },
      });

      clearErrors();

      toast.success(t('departments.notifications.updateSuccess'));

      await onSuccess?.();

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Update Department',
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
