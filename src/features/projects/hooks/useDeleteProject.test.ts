import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE_PROJECT_MUTATION, PROJECTS_QUERY } from '@/api/projects';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

import { useDeleteProject } from './useDeleteProject';

vi.mock('@/components/hooks/useDeleteEntity', () => ({
  useDeleteEntity: vi.fn(),
}));

describe('useDeleteProject', () => {
  const handleDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: false,
    } as never);
  });

  it('configures delete entity hook for projects', () => {
    renderHook(() => useDeleteProject());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(config.mutation).toBe(DELETE_PROJECT_MUTATION);
    expect(config.successMessageKey).toBe(
      'projects.notifications.deleteSuccess',
    );
    expect(config.defaultSuccessMessage).toBe(
      'Project has been successfully deleted',
    );
    expect(config.errorContext).toBe('Delete Project');
  });

  it('builds correct mutation variables', () => {
    renderHook(() => useDeleteProject());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    const variables = config.buildVariables('project-123');

    expect(variables).toEqual({
      project: {
        projectId: 'project-123',
      },
    });
  });

  it('checks whether project was successfully deleted', () => {
    renderHook(() => useDeleteProject());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(
      config.isSuccessCheck?.({
        deleteProject: {
          affected: 1,
        },
      }),
    ).toBe(true);

    expect(
      config.isSuccessCheck?.({
        deleteProject: {
          affected: 0,
        },
      }),
    ).toBe(false);
  });

  it('configures projects query refetch after deletion', () => {
    renderHook(() => useDeleteProject());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(config.mutationOptions).toEqual({
      refetchQueries: [PROJECTS_QUERY],
      awaitRefetchQueries: true,
    });
  });

  it('passes onSuccess callback and returns delete state', () => {
    const onSuccess = vi.fn();

    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: true,
    } as never);

    const { result } = renderHook(() =>
      useDeleteProject({
        onSuccess,
      }),
    );

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(config.onSuccess).toBe(onSuccess);

    expect(result.current.handleDelete).toBe(handleDelete);
    expect(result.current.loading).toBe(true);
  });
});
