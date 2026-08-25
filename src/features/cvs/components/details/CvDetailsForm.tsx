'use client';

import { useUpdateCvForm } from '@/features/cvs/hooks/useUpdateCvForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  const {
    formData,
    errors,
    loading: isUpdating,
    isValid,
    validateField,
    handleChange,
    handleSubmit,
    t,
  } = useUpdateCvForm({
    cvId,
    initialValues: {
      name,
      education,
      description,
    },
    onSuccess: () => {
      void onUpdated();
    },
  });

  const trimmedName = formData.name.trim();
  const trimmedEducation = formData.education.trim();
  const trimmedDescription = formData.description.trim();

  const isChanged =
    trimmedName !== name.trim() ||
    trimmedEducation !== education.trim() ||
    trimmedDescription !== description.trim();

  const handleUpdate = async () => {
    if (!canEdit || !isChanged || !isValid || isUpdating) return;
    await handleSubmit();
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mt-6 flex w-full max-w-[664px] flex-col gap-y-8 lg:w-[852px] lg:max-w-none">
        <Input
          id="name"
          value={formData.name}
          onChange={handleChange('name')}
          onBlur={() => validateField('name')}
          placeholder={t('cvs.name', 'Name')}
          disabled={!canEdit || isUpdating}
          error={canEdit && errors.name ? t(errors.name) : undefined}
          className="h-12 w-full disabled:opacity-100"
        />
        <Input
          id="education"
          value={formData.education}
          onChange={handleChange('education')}
          onBlur={() => validateField('education')}
          placeholder={t('cvs.education', 'Education')}
          disabled={!canEdit || isUpdating}
          error={canEdit && errors.education ? t(errors.education) : undefined}
          className="h-12 w-full disabled:opacity-100"
        />
        <Textarea
          id="description"
          value={formData.description}
          onChange={handleChange('description')}
          onBlur={() => validateField('description')}
          placeholder={t('cvs.description', 'Description')}
          disabled={!canEdit || isUpdating}
          rows={10}
          error={
            canEdit && errors.description ? t(errors.description) : undefined
          }
          className="w-full resize-none disabled:opacity-100 min-h-[160px]"
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
