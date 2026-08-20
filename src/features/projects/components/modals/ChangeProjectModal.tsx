'use client';

import React, { ChangeEvent } from 'react';
import { useQuery } from '@apollo/client/react';
import type { TFunction } from 'i18next';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { CreateProjectInputValues } from '@/lib/validations/project';
import { SKILLS_QUERY } from '@/api/skills';

const SKILLS_LIMIT = 1000;

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
  setFieldValue: (field: keyof CreateProjectInputValues, value: string) => void;
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
  setFieldValue,
  handleSubmit,
  t,
}: ChangeProjectModalProps) {
  const { data: skillsData, loading: skillsLoading } = useQuery(SKILLS_QUERY, {
    variables: {
      params: {
        limit: SKILLS_LIMIT,
      },
    },
  });

  const skillOptions = (skillsData?.skills?.items || []).map((skill) => ({
    value: skill.name,
    label: skill.name,
  }));

  const handleDateSelect =
    (field: keyof CreateProjectInputValues) => (dateString: string) => {
      const fieldHandler = handleChange(field);
      fieldHandler({
        target: { value: dateString },
      } as ChangeEvent<HTMLInputElement>);
    };

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
          <DatePicker
            value={formData.startDate}
            onChange={handleDateSelect('startDate')}
            placeholder={t('projects.startDate', 'Start Date')}
            required
            error={
              errors.startDate
                ? t(errors.startDate, 'Start date is required')
                : undefined
            }
          />
          <DatePicker
            value={formData.endDate}
            onChange={handleDateSelect('endDate')}
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

        <div>
          <Select
            items={skillOptions}
            value={formData.environment}
            onValueChange={(value) => {
              if (value) {
                setFieldValue('environment', value);
              }
            }}
            disabled={skillsLoading}
          >
            <SelectTrigger
              label={t('projects.environment', 'Environment')}
              error={errors.environment ? t(errors.environment) : undefined}
              className="border-[#AEAEAE] bg-secondary"
              aria-label={t('projects.environment', 'Environment')}
              aria-invalid={Boolean(errors.environment)}
            >
              <SelectValue
                placeholder={t('projects.environment', 'Environment')}
              />
            </SelectTrigger>

            <SelectContent>
              {skillOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ChangeDialog>
  );
}
