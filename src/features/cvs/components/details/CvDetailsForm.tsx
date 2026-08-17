'use client';

import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client/react';
import { toast } from '@/components/ui/sonner';
import { UPDATE_CV_MUTATION } from '@/api/cvs';
import { useValidatedForm } from '@/components/hooks/useValidatedForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCvSchema, type CreateCvFormValues } from '@/lib/validations/cv';
import { handleFormError } from '@/lib/error/errorHandler';

type CvDetailsFormProps = {
  cvId: string;
  name: string;
  education: string;
  description: string;
  canEdit: boolean;
  onUpdated: () => Promise<unknown>;
};

export function CvDetailsForm({
  cvId,
  name,
  education,
  description,
  canEdit,
  onUpdated,
}: CvDetailsFormProps) {
  const { t } = useTranslation();

  const { formData, errors, validateForm, handleChange } =
    useValidatedForm<CreateCvFormValues>({
      initialValues: {
        name,
        education,
        description,
      },
      schema: createCvSchema,
    });

  const [updateCv, { loading: isUpdating }] = useMutation(UPDATE_CV_MUTATION);

  const trimmedName = formData.name.trim();
  const trimmedEducation = formData.education.trim();
  const trimmedDescription = formData.description.trim();

  const isChanged =
    trimmedName !== name.trim() ||
    trimmedEducation !== education.trim() ||
    trimmedDescription !== description.trim();

  const isValid = createCvSchema.safeParse(formData).success;

  const handleUpdate = async () => {
    if (!canEdit || !isChanged || isUpdating) return;
    if (!validateForm()) return;

    try {
      await updateCv({
        variables: {
          cv: {
            cvId,
            name: trimmedName,
            education: trimmedEducation,
            description: trimmedDescription,
          },
        },
      });

      await onUpdated();

      toast.success(
        t('cvs.notifications.updateSuccess', 'CV was successfully updated!'),
      );
    } catch (err) {
      handleFormError(err, {
        t,
        context: 'Update CV',
      });
    }
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mt-6 flex w-full max-w-[664px] flex-col gap-y-6 lg:w-[852px] lg:max-w-none">
        <Input
          id="name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder={t('cvs.name', 'Name')}
          disabled={!canEdit || isUpdating}
          error={canEdit && errors.name ? t(errors.name) : undefined}
          className="h-12 w-full disabled:opacity-100"
        />
        <Input
          id="education"
          value={formData.education}
          onChange={handleChange('education')}
          placeholder={t('cvs.education', 'Education')}
          disabled={!canEdit || isUpdating}
          error={canEdit && errors.education ? t(errors.education) : undefined}
          className="h-12 w-full disabled:opacity-100"
        />
        <Textarea
          id="description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder={t('cvs.description', 'Description')}
          disabled={!canEdit || isUpdating}
          rows={5}
          error={
            canEdit && errors.description ? t(errors.description) : undefined
          }
          className="w-full resize-none disabled:opacity-100"
        />
      </div>

      {canEdit && (
        <div className="mt-9 flex w-full max-w-[664px] justify-end lg:w-[852px] lg:max-w-none">
          <Button
            type="button"
            disabled={!isChanged || !isValid || isUpdating}
            onClick={handleUpdate}
            className="w-[220px]"
          >
            {t('update', 'UPDATE')}
          </Button>
        </div>
      )}
    </div>
  );
}
