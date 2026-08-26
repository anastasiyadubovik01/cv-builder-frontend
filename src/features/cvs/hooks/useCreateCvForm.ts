import { CREATE_CV_MUTATION } from '@/api/cvs';
import { type CreateCvFormValues } from '@/lib/validations/cv';
import { useCvForm } from './useCvForm';

const INITIAL_VALUES: CreateCvFormValues = {
  name: '',
  education: '',
  description: '',
};

type UseCreateCvFormOptions = {
  userId?: string;
  onSuccess?: () => void | Promise<void>;
};

export function useCreateCvForm({
  userId,
  onSuccess,
}: UseCreateCvFormOptions = {}) {
  const form = useCvForm({
    mutation: CREATE_CV_MUTATION,
    initialValues: INITIAL_VALUES,
    successMessageKey: 'cvs.notifications.createSuccess',
    defaultSuccessMessage: 'CV has been successfully created',
    errorContext: 'Create CV',
    buildVariables: (values) => ({
      cv: { ...values, userId: userId || undefined },
    }),
    onSuccess,
  });

  const handleSubmit = async () => {
    const ok = await form.handleSubmit();
    if (ok) form.resetForm();
    return ok;
  };

  return { ...form, handleSubmit };
}
