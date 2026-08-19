'use client';

import React, { ChangeEvent } from 'react';
import type { TFunction } from 'i18next';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { CreateProjectInputValues } from '@/lib/validations/project';

export interface ChangeProjectModalProps {
  type: createActionTitles | updateActionTitles;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  formData: CreateProjectInputValues;
  errors: Partial<Record<keyof CreateProjectInputValues, string>>;
  loading: boolean;
  handleChange: (
    field: keyof CreateProjectInputValues,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: () => Promise<boolean>;
  t: TFunction;
}

export function ChangeProjectModal({
  type,
  trigger,
  open,
  onOpenChange,
  formData,
  errors,
  loading,
  handleChange,
  handleSubmit,
  t,
}: ChangeProjectModalProps) {
  return (
    <ChangeDialog
      actionTitle={type}
      itemType="project"
      onConfirm={handleSubmit}
      confirmDisabled={loading}
      trigger={trigger}
      t={t}
      open={open}
      onOpenChange={onOpenChange}
      size="wide"
    >
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            value={formData.name}
            onChange={handleChange('name')}
            placeholder={t('projects.name', 'Name')}
            required
            error={
              errors.name
                ? t(errors.name, 'Project name is required')
                : undefined
            }
          />
          <Input
            value={formData.domain}
            onChange={handleChange('domain')}
            placeholder={t('projects.domain', 'Domain')}
            required
            error={
              errors.domain ? t(errors.domain, 'Domain is required') : undefined
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="date"
            value={formData.startDate}
            onChange={handleChange('startDate')}
            placeholder={t('projects.startDate', 'Start Date')}
            required
            error={
              errors.startDate
                ? t(errors.startDate, 'Start date is required')
                : undefined
            }
          />
          <Input
            type="date"
            value={formData.endDate}
            onChange={handleChange('endDate')}
            placeholder={t('projects.endDate', 'End Date')}
            error={
              errors.endDate
                ? t(errors.endDate, 'End date is required')
                : undefined
            }
          />
        </div>

        <Textarea
          value={formData.description}
          onChange={handleChange('description')}
          placeholder={t('projects.description', 'Description')}
          required
          rows={4}
          error={
            errors.description
              ? t(errors.description, 'Description is required')
              : undefined
          }
        />

        <Input
          value={formData.environment}
          onChange={handleChange('environment')}
          placeholder={t('projects.environment', 'Environment')}
          error={errors.environment ? t(errors.environment) : undefined}
        />
      </div>
    </ChangeDialog>
  );
}
