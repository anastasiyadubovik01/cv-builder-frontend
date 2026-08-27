import { DELETE_DEPARTMENT_MUTATION } from '@/api/departments';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type DeleteDepartmentData = {
  deleteDepartment: { affected: number };
};

type DeleteDepartmentVars = {
  department: { departmentId: string };
};

type UseDeleteDepartmentOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useDeleteDepartment({
  onSuccess,
}: UseDeleteDepartmentOptions = {}) {
  const { handleDelete, loading } = useDeleteEntity<
    DeleteDepartmentData,
    DeleteDepartmentVars,
    [departmentId: string]
  >({
    mutation: DELETE_DEPARTMENT_MUTATION,
    successMessageKey: 'departments.notifications.deleteSuccess',
    errorContext: 'Delete Department',
    buildVariables: (departmentId) => ({ department: { departmentId } }),
    isSuccessCheck: (data) => Boolean(data?.deleteDepartment?.affected),
    onSuccess,
  });

  return { handleDelete, loading };
}
