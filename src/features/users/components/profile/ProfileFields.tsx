'use client';

import { useState } from 'react';
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

  const [currentFirstName, setCurrentFirstName] = useState(firstName);
  const [currentLastName, setCurrentLastName] = useState(lastName);
  const [currentDepartmentId, setCurrentDepartmentId] = useState(departmentId);
  const [currentPositionId, setCurrentPositionId] = useState(positionId);

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

  const firstNameError =
    trimmedFirstName.length === 0
      ? t('users.details.validation.firstNameRequired')
      : null;

  const lastNameError =
    trimmedLastName.length === 0
      ? t('users.details.validation.lastNameRequired')
      : null;

  const departmentError =
    currentDepartmentId === ''
      ? t('users.details.validation.departmentRequired')
      : null;

  const positionError =
    currentPositionId === ''
      ? t('users.details.validation.positionRequired')
      : null;

  const namesChanged =
    trimmedFirstName !== firstName.trim() ||
    trimmedLastName !== lastName.trim();

  const organizationChanged =
    currentDepartmentId !== departmentId || currentPositionId !== positionId;

  const isChanged = namesChanged || organizationChanged;

  const isValid =
    !firstNameError &&
    !lastNameError &&
    !departmentError &&
    !positionError &&
    trimmedFirstName.length <= 100 &&
    trimmedLastName.length <= 100;

  const isUpdating = profileUpdating || userUpdating;

  const handleUpdate = async () => {
    if (!canEdit || !isChanged || !isValid || isUpdating) {
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
            onChange={(event) => setCurrentFirstName(event.target.value)}
            disabled={!canEdit}
            maxLength={100}
            className="h-12 w-full disabled:opacity-100"
          />

          {canEdit && firstNameError && (
            <p className="ml-4 mt-1 text-sm text-destructive">
              {firstNameError}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className={labelClassName}>
            {t('users.details.fields.lastName')}
          </Label>

          <Input
            id="lastName"
            value={currentLastName}
            onChange={(event) => setCurrentLastName(event.target.value)}
            disabled={!canEdit}
            maxLength={100}
            className="h-12 w-full disabled:opacity-100"
          />

          {canEdit && lastNameError && (
            <p className="ml-4 mt-1 text-sm text-destructive">
              {lastNameError}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="department" className={labelClassName}>
            {t('users.details.fields.department')}
          </Label>

          <Select
            value={currentDepartmentId}
            onValueChange={(value) => {
              if (value !== null) {
                setCurrentDepartmentId(value);
              }
            }}
            disabled={!canEdit}
          >
            <SelectTrigger id="department" className="h-12 w-full">
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

          {canEdit && departmentError && (
            <p className="ml-4 mt-1 text-sm text-destructive">
              {departmentError}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="position" className={labelClassName}>
            {t('users.details.fields.position')}
          </Label>

          <Select
            value={currentPositionId}
            onValueChange={(value) => {
              if (value !== null) {
                setCurrentPositionId(value);
              }
            }}
            disabled={!canEdit}
          >
            <SelectTrigger id="position" className="h-12 w-full">
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

          {canEdit && positionError && (
            <p className="ml-4 mt-1 text-sm text-destructive">
              {positionError}
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
