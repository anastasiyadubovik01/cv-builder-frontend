'use client';

import type { ChangeEvent, ReactNode } from 'react';
import type { TFunction } from 'i18next';

import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { CreateCvProjectInputValues } from '@/lib/validations/cv-project';
import type { ApiProject } from '@/api/projects';
import type { Position } from '@/api/positions';

type SelectOption = {
  value: string;
  label: string;
};

export type ChangeCvProjectModalProps = {
  type: createActionTitles | updateActionTitles;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  formData: CreateCvProjectInputValues;
  errors: Partial<Record<keyof CreateCvProjectInputValues, string>>;

  catalogProjects: ApiProject[];
  positions: Position[];

  loading: boolean;
  isValid?: boolean;

  handleChange: (
    field: keyof CreateCvProjectInputValues,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;

  setFieldValue: (
    field: keyof CreateCvProjectInputValues,
    value: string,
  ) => void;
  validateField: (field: keyof CreateCvProjectInputValues) => boolean;
  handleProjectSelect?: (projectId: string) => void;
  handleSubmit: () => Promise<boolean>;
  t: TFunction;
};

export function ChangeCvProjectModal({
  type,
  trigger,
  open,
  onOpenChange,
  formData,
  errors,
  catalogProjects,
  positions,
  loading,
  isValid = false,
  handleChange,
  setFieldValue,
  validateField,
  handleProjectSelect,
  handleSubmit,
  t,
}: ChangeCvProjectModalProps) {
  const isUpdate = type === 'Update';

  const projectItems: SelectOption[] = catalogProjects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const roleOptions: SelectOption[] = positions.map((p) => ({
    value: p.name,
    label: p.name,
  }));

  const environmentSkills = formData.environment
    ? formData.environment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const environmentOptions: SelectOption[] = environmentSkills.map((s) => ({
    value: s,
    label: s,
  }));

  const selectedRoles = formData.roles
    ? formData.roles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
    : [];

  const handleRolesChange = (newRoles: string[]) => {
    setFieldValue('roles', newRoles.join(', '));
  };

  const handleDateSelect =
    (field: keyof CreateCvProjectInputValues) => (dateString: string) => {
      setFieldValue(field, dateString);
    };

  return (
    <ChangeDialog
      actionTitle={type}
      itemType="project"
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={handleSubmit}
      confirmDisabled={!isValid || loading}
      size="wide"
      t={t}
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Select
              items={projectItems}
              value={formData.projectId}
              disabled={isUpdate}
              onValueChange={(value) => {
                if (value) {
                  handleProjectSelect?.(value);
                  setFieldValue('projectId', value);
                }
              }}
            >
              <SelectTrigger
                label={t('projects.name', 'Name')}
                className="border-[#AEAEAE] bg-secondary data-[disabled]:cursor-default"
                error={errors.projectId ? t(errors.projectId) : undefined}
                aria-label={t('projects.name', 'Name')}
                aria-invalid={Boolean(errors.projectId)}
                onBlur={() => validateField('projectId')}
              >
                <SelectValue placeholder={t('projects.name', 'Name')} />
              </SelectTrigger>

              <SelectContent>
                {projectItems.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            value={formData.domain || ''}
            placeholder={t('projects.domain', 'Domain')}
            disabled
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePicker
            value={formData.startDate}
            onChange={handleDateSelect('startDate')}
            onBlur={() => validateField('startDate')}
            placeholder={t('projects.startDate', 'Start Date')}
            required
            error={errors.startDate ? t(errors.startDate) : undefined}
          />

          <DatePicker
            value={formData.endDate}
            onChange={handleDateSelect('endDate')}
            onBlur={() => validateField('endDate')}
            placeholder={t('projects.endDate', 'End Date')}
            required
            error={errors.endDate ? t(errors.endDate) : undefined}
          />
        </div>

        <Textarea
          value={formData.description || ''}
          placeholder={t('projects.description', 'Description')}
          disabled
          required
          rows={4}
        />

        <MultiSelect
          options={environmentOptions}
          value={environmentSkills}
          onChange={() => {}}
          placeholder={t('projects.environment', 'Environment')}
          label={t('projects.environment', 'Environment')}
          disabled
        />

        <div
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              validateField('roles');
            }
          }}
        >
          <MultiSelect
            options={roleOptions}
            value={selectedRoles}
            onChange={handleRolesChange}
            placeholder={t('projects.roles', 'Roles')}
            label={t('projects.roles', 'Roles')}
            error={errors.roles ? t(errors.roles) : undefined}
          />
        </div>

        <Textarea
          value={formData.responsibilities || ''}
          onChange={handleChange('responsibilities')}
          onBlur={() => validateField('responsibilities')}
          placeholder={t('projects.responsibilities', 'Responsibilities')}
          variant="input"
          error={
            errors.responsibilities ? t(errors.responsibilities) : undefined
          }
        />
      </div>
    </ChangeDialog>
  );
}
