import { DELETE_CV_MUTATION } from '@/api/cvs';
import { useDeleteEntity } from '../../../components/hooks/useDeleteEntity';

type DeleteCvData = {
  deleteCv: { affected: number };
};

type DeleteCvVariables = {
  cv: { cvId: string };
};

type UseDeleteCvOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteCv(options: UseDeleteCvOptions = {}) {
  const { handleDelete, loading, t } = useDeleteEntity<
    DeleteCvData,
    DeleteCvVariables,
    [cvId: string]
  >({
    mutation: DELETE_CV_MUTATION,
    successMessageKey: 'cvs.notifications.deleteSuccess',
    defaultSuccessMessage: 'The CV was successfully deleted!',
    errorContext: 'Delete CV',
    buildVariables: (cvId) => ({ cv: { cvId } }),
    isSuccessCheck: (data) => Boolean(data?.deleteCv?.affected),
    onSuccess: options.onSuccess,
  });

  return { handleDelete, loading, t };
}
