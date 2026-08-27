'use client';

import React, { ChangeEvent } from 'react';
import { useQuery } from '@apollo/client/react';
import { ChangeDialog } from '@/components/dialogs/ChangeDialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import type {
  createActionTitles,
  updateActionTitles,
} from '@/components/dialogs/types';
import { CreateProjectInputValues } from '@/lib/validations/project';
import { SKILLS_QUERY } from '@/api/skills';
import { useTranslation } from 'react-i18next';

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
}: ChangeProjectModalProps) {
  const { t } = useTranslation();
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

  const selectedSkills = formData.environment
    ? formData.environment
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const handleSkillsChange = (newSkills: string[]) => {
    setFieldValue('environment', newSkills.join(', '));
  };

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

        <MultiSelect
          options={skillOptions}
          value={selectedSkills}
          onChange={handleSkillsChange}
          placeholder={t('projects.environment', 'Environment')}
          label={t('projects.environment', 'Environment')}
          error={errors.environment ? t(errors.environment) : undefined}
          disabled={skillsLoading}
        />
      </div>
    </ChangeDialog>
  );
}
