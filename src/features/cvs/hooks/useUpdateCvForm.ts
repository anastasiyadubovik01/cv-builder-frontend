import { UPDATE_CV_MUTATION } from '@/api/cvs';
import { type CreateCvFormValues } from '@/lib/validations/cv';
import { useCvForm } from '@/features/cvs/hooks/useCvForm';

type UseUpdateCvFormOptions = {
  cvId: string;
  initialValues: CreateCvFormValues;
  onSuccess?: () => void | Promise<void>;
};

export function useUpdateCvForm({
  cvId,
  initialValues,
  onSuccess,
}: UseUpdateCvFormOptions) {
  return useCvForm({
    mutation: UPDATE_CV_MUTATION,
    initialValues,
    successMessageKey: 'cvs.notifications.updateSuccess',
    defaultSuccessMessage: 'CV was successfully updated!',
    errorContext: 'Update CV',
    buildVariables: (values) => ({
      cv: { cvId, ...values },
    }),
    onSuccess,
  });
}
