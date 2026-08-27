import {
  REMOVE_CV_PROJECT_MUTATION,
  type ApiCvProject,
} from '@/api/cv-projects';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

type RemoveCvProjectData = {
  removeCvProject: { id: string; projects: ApiCvProject[] };
};

type RemoveCvProjectVariables = {
  project: { cvId: string; projectId: string };
};

type UseRemoveCvProjectOptions = {
  onSuccess?: () => void | Promise<void>;
};

export function useRemoveCvProject(options: UseRemoveCvProjectOptions = {}) {
  const { handleDelete, loading } = useDeleteEntity<
    RemoveCvProjectData,
    RemoveCvProjectVariables,
    [cvId: string, projectId: string]
  >({
    mutation: REMOVE_CV_PROJECT_MUTATION,
    successMessageKey: 'projects.notifications.removeCvProjectSuccess',
    defaultSuccessMessage: 'Project has been successfully removed from CV',
    errorContext: 'Remove CV Project',
    buildVariables: (cvId, projectId) => ({ project: { cvId, projectId } }),
    isSuccessCheck: (data) => Boolean(data?.removeCvProject?.id),
    onSuccess: options.onSuccess,
  });

  return { handleDelete, loading };
}
