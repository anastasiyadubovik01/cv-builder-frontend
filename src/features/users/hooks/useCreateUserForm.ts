import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

import {
  CREATE_USER_MUTATION,
  DEPARTMENTS_QUERY,
  POSITIONS_QUERY,
} from '@/api/users';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import {
  createUserSchema,
  type CreateUserFormValues,
} from '@/lib/validations/user';

const INITIAL_VALUES: CreateUserFormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  departmentId: '',
  positionId: '',
  role: 'Employee',
};

type UseCreateUserFormOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useCreateUserForm({
  onSuccess,
}: UseCreateUserFormOptions = {}) {
  const { t } = useTranslation();

  const {
    formData,
    setFormData,
    errors,
    validateForm,
    validateField,
    setFieldValue,
    handleChange,
    clearErrors,
  } = useValidatedForm<CreateUserFormValues>({
    initialValues: INITIAL_VALUES,
    schema: createUserSchema,
  });

  const { data: departmentsData } = useQuery(DEPARTMENTS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const { data: positionsData } = useQuery(POSITIONS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
  });

  const [createUser, { loading }] = useMutation(CREATE_USER_MUTATION);

  const departments = departmentsData?.departments.items ?? [];
  const positions = positionsData?.positions.items ?? [];

  const isValid = createUserSchema.safeParse(formData).success;

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    try {
      await createUser({
        variables: {
          user: {
            auth: {
              email: formData.email.trim(),
              password: formData.password,
            },
            profile: {
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
            },
            departmentId: formData.departmentId,
            positionId: formData.positionId,
            role: formData.role,
          },
        },
      });

      setFormData(INITIAL_VALUES);
      clearErrors();

      await onSuccess?.();

      toast.success(t('users.create.success'));

      return true;
    } catch (error) {
      handleFormError(error, {
        t,
        context: 'Create user',
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
