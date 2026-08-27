import { DELETE_POSITION_MUTATION } from '@/api/positions';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type DeletePositionData = {
  deletePosition: { affected: number };
};

type DeletePositionVars = {
  position: { positionId: string };
};

type UseDeletePositionOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeletePosition({
  onSuccess,
}: UseDeletePositionOptions = {}) {
  const { handleDelete, loading, t } = useDeleteEntity<
    DeletePositionData,
    DeletePositionVars,
    [positionId: string]
  >({
    mutation: DELETE_POSITION_MUTATION,
    successMessageKey: 'positions.notifications.deleteSuccess',
    errorContext: 'Delete Position',
    buildVariables: (positionId) => ({ position: { positionId } }),
    isSuccessCheck: (data) => Boolean(data?.deletePosition?.affected),
    onSuccess,
  });

  return { handleDelete, loading, t };
}
