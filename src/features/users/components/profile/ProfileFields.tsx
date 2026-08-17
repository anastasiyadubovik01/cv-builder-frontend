'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import {
  DEPARTMENTS_QUERY,
  POSITIONS_QUERY,
  UPDATE_PROFILE_MUTATION,
  UPDATE_USER_MUTATION,
} from '@/api/users';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  profileSchema,
  type ProfileFormValues,
} from '@/lib/validations/profile';

type ProfileFieldsProps = {
  userId: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  department: string;
  positionId: string;
  position: string;
  role: string;
  canEdit: boolean;
  canVerifyEmail: boolean;
  onUpdated: () => Promise<unknown>;
};

export function ProfileFields({
  userId,
  firstName,
  lastName,
  departmentId,
  department,
  positionId,
  position,
  role,
  canEdit,
  canVerifyEmail,
  onUpdated,
}: ProfileFieldsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const {
    formData,
    setFormData,
    errors,
    setErrors,
    validateForm,
    handleChange,
  } = useValidatedForm<ProfileFormValues>({
    initialValues: {
      firstName,
      lastName,
      departmentId,
      positionId,
    },
    schema: profileSchema,
  });

  const {
    firstName: currentFirstName,
    lastName: currentLastName,
    departmentId: currentDepartmentId,
    positionId: currentPositionId,
  } = formData;

  const { data: departmentsData } = useQuery(DEPARTMENTS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
    skip: !canEdit,
  });

  const { data: positionsData } = useQuery(POSITIONS_QUERY, {
    variables: {
      params: {
        page: 1,
        limit: 100,
      },
    },
    skip: !canEdit,
  });

  const [updateProfile, { loading: profileUpdating }] = useMutation(
    UPDATE_PROFILE_MUTATION,
  );

  const [updateUser, { loading: userUpdating }] =
    useMutation(UPDATE_USER_MUTATION);

  const departments = departmentsData?.departments.items ?? [];
  const positions = positionsData?.positions.items ?? [];

  const selectedDepartment = departments.find(
    (item) => item.id === currentDepartmentId,
  );

  const selectedPosition = positions.find(
    (item) => item.id === currentPositionId,
  );

  const trimmedFirstName = currentFirstName.trim();
  const trimmedLastName = currentLastName.trim();

  const namesChanged =
    trimmedFirstName !== firstName.trim() ||
    trimmedLastName !== lastName.trim();

  const organizationChanged =
    currentDepartmentId !== departmentId || currentPositionId !== positionId;

  const isChanged = namesChanged || organizationChanged;
  const isValid = profileSchema.safeParse(formData).success;
  const isUpdating = profileUpdating || userUpdating;

  const handleDepartmentChange = (value: string | null) => {
    if (value === null) return;

    setFormData((prev) => ({
      ...prev,
      departmentId: value,
    }));

    if (errors.departmentId) {
      setErrors((prev) => ({
        ...prev,
        departmentId: undefined,
      }));
    }
  };

  const handlePositionChange = (value: string | null) => {
    if (value === null) return;

    setFormData((prev) => ({
      ...prev,
      positionId: value,
    }));

    if (errors.positionId) {
      setErrors((prev) => ({
        ...prev,
        positionId: undefined,
      }));
    }
  };

  const handleUpdate = async () => {
    if (!canEdit || !isChanged || isUpdating) {
      return;
    }

    if (!validateForm()) {
      return;
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

      if (organizationChanged) {
        await updateUser({
          variables: {
            user: {
              userId,
              departmentId: currentDepartmentId,
              positionId: currentPositionId,
              role,
            },
          },
        });
      }

      await onUpdated();

      toast.success(t('users.details.updateSuccess'), {
        description: t('users.details.updateSuccessDescription'),
      });
    } catch {
      toast.error(t('users.details.updateError'), {
        description: t('users.details.updateErrorDescription'),
      });
    }
  };

  const labelClassName =
    'ml-4 text-[12px] leading-[23px] font-normal tracking-[0.15px] text-[#626262] dark:text-[#AEAEAE]';

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mt-[47px] grid w-full max-w-[664px] grid-cols-1 gap-y-9 lg:w-[852px] lg:max-w-none lg:grid-cols-[410px_410px] lg:gap-x-8">
        <div>
          <Label htmlFor="firstName" className={labelClassName}>
            {t('users.details.fields.firstName')}
          </Label>

          <Input
            id="firstName"
            value={currentFirstName}
            onChange={handleChange('firstName')}
            disabled={!canEdit}
            maxLength={100}
            error={
              canEdit && errors.firstName ? t(errors.firstName) : undefined
            }
            className="h-12 w-full disabled:opacity-100"
          />
        </div>

        <div>
          <Label htmlFor="lastName" className={labelClassName}>
            {t('users.details.fields.lastName')}
          </Label>

          <Input
            id="lastName"
            value={currentLastName}
            onChange={handleChange('lastName')}
            disabled={!canEdit}
            maxLength={100}
            error={canEdit && errors.lastName ? t(errors.lastName) : undefined}
            className="h-12 w-full disabled:opacity-100"
          />
        </div>

        <div>
          <Label htmlFor="department" className={labelClassName}>
            {t('users.details.fields.department')}
          </Label>

          <Select
            value={currentDepartmentId}
            onValueChange={handleDepartmentChange}
            disabled={!canEdit}
          >
            <SelectTrigger
              id="department"
              className="h-12 w-full"
              aria-invalid={Boolean(canEdit && errors.departmentId)}
            >
              <SelectValue>
                {selectedDepartment?.name ||
                  department ||
                  t('users.details.notAssigned')}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {departments.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canEdit && errors.departmentId && (
            <p className="ml-4 mt-1 text-xs text-destructive">
              {t(errors.departmentId)}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="position" className={labelClassName}>
            {t('users.details.fields.position')}
          </Label>

          <Select
            value={currentPositionId}
            onValueChange={handlePositionChange}
            disabled={!canEdit}
          >
            <SelectTrigger
              id="position"
              className="h-12 w-full"
              aria-invalid={Boolean(canEdit && errors.positionId)}
            >
              <SelectValue>
                {selectedPosition?.name ||
                  position ||
                  t('users.details.notAssigned')}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {positions.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canEdit && errors.positionId && (
            <p className="ml-4 mt-1 text-xs text-destructive">
              {t(errors.positionId)}
            </p>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="mt-9 flex w-full max-w-[664px] justify-end gap-6 lg:w-[852px] lg:max-w-none">
          {canVerifyEmail && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/verify-email')}
              className="w-[220px]"
            >
              {t('verifyEmail')}
            </Button>
          )}

          <Button
            type="button"
            disabled={!isChanged || !isValid || isUpdating}
            onClick={handleUpdate}
            className="w-[220px]"
          >
            {t('update')}
          </Button>
        </div>
      )}
    </div>
  );
}
