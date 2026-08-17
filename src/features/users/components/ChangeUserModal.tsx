'use client';

import type { ReactNode } from 'react';

import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUserForm } from '@/features/users/hooks/useCreateUserForm';

export type ChangeUserModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

type SelectOption = {
  value: string;
  label: string;
};

type NamedEntity = {
  id: string;
  name: string;
};

export function ChangeUserModal({
  type,
  trigger,
  onSuccess,
}: ChangeUserModalProps) {
  const {
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
  } = useCreateUserForm({ onSuccess });

  const departmentItems: SelectOption[] = departments.map(
    (department: NamedEntity) => ({
      value: String(department.id),
      label: department.name,
    }),
  );

  const positionItems: SelectOption[] = positions.map(
    (position: NamedEntity) => ({
      value: String(position.id),
      label: position.name,
    }),
  );

  const roleItems: SelectOption[] = [
    {
      value: 'Employee',
      label: t('users.roles.employee'),
    },
    {
      value: 'Admin',
      label: t('users.roles.admin'),
    },
  ];

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="user"
      trigger={trigger}
      onConfirm={handleSubmit}
      confirmDisabled={!isValid || loading}
      size="wide"
      t={t}
    >
      <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-2 lg:gap-x-3 lg:gap-y-9">
        <Input
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={() => validateField('email')}
          placeholder={t('users.create.email')}
          error={errors.email ? t(errors.email) : undefined}
        />

        <PasswordInput
          value={formData.password}
          onChange={handleChange('password')}
          onBlur={() => validateField('password')}
          placeholder={t('users.create.password')}
          error={errors.password ? t(errors.password) : undefined}
        />

        <Input
          value={formData.firstName}
          onChange={handleChange('firstName')}
          onBlur={() => validateField('firstName')}
          placeholder={t('users.create.firstName')}
          error={errors.firstName ? t(errors.firstName) : undefined}
        />

        <Input
          value={formData.lastName}
          onChange={handleChange('lastName')}
          onBlur={() => validateField('lastName')}
          placeholder={t('users.create.lastName')}
          error={errors.lastName ? t(errors.lastName) : undefined}
        />

        <div>
          <Select
            items={departmentItems}
            value={formData.departmentId}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('departmentId', value);
              }
            }}
          >
            <SelectTrigger
              className="bg-secondary border-[#AEAEAE]"
              aria-label={t('users.create.department')}
              aria-invalid={Boolean(errors.departmentId)}
              onBlur={() => validateField('departmentId')}
            >
              <SelectValue placeholder={t('users.create.department')} />
            </SelectTrigger>

            <SelectContent>
              {departmentItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.departmentId && (
            <p className="mt-1 ml-3 text-xs text-destructive">
              {t(errors.departmentId)}
            </p>
          )}
        </div>

        <div>
          <Select
            items={positionItems}
            value={formData.positionId}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('positionId', value);
              }
            }}
          >
            <SelectTrigger
              className="bg-secondary border-[#AEAEAE]"
              aria-label={t('users.create.position')}
              aria-invalid={Boolean(errors.positionId)}
              onBlur={() => validateField('positionId')}
            >
              <SelectValue placeholder={t('users.create.position')} />
            </SelectTrigger>

            <SelectContent>
              {positionItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.positionId && (
            <p className="mt-1 ml-3 text-xs text-destructive">
              {t(errors.positionId)}
            </p>
          )}
        </div>

        <div>
          <Select
            items={roleItems}
            value={formData.role}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('role', value);
              }
            }}
          >
            <SelectTrigger
              className="bg-secondary border-[#AEAEAE]"
              aria-label={t('users.create.role')}
              aria-invalid={Boolean(errors.role)}
              onBlur={() => validateField('role')}
            >
              <SelectValue placeholder={t('users.create.role')} />
            </SelectTrigger>

            <SelectContent>
              {roleItems.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.role && (
            <p className="mt-1 ml-3 text-xs text-destructive">
              {t(errors.role)}
            </p>
          )}
        </div>
      </div>
    </ChangeDialog>
  );
}
