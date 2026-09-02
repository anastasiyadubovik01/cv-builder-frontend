import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { REMOVE_CV_PROJECT_MUTATION } from '@/api/cv-projects';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

import { useRemoveCvProject } from './useRemoveCvProject';

vi.mock('@/components/hooks/useDeleteEntity', () => ({
  useDeleteEntity: vi.fn(),
}));

describe('useRemoveCvProject', () => {
  const handleDelete = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: false,
    } as never);
  });

  it('configures delete entity hook', () => {
    renderHook(() =>
      useRemoveCvProject({
        onSuccess,
      }),
    );

    expect(useDeleteEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: REMOVE_CV_PROJECT_MUTATION,
        successMessageKey: 'projects.notifications.removeCvProjectSuccess',
        defaultSuccessMessage: 'Project has been successfully removed from CV',
        errorContext: 'Remove CV Project',
        onSuccess,
      }),
    );
  });

  it('builds mutation variables', () => {
    renderHook(() => useRemoveCvProject());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    const variables = config.buildVariables('cv-1', 'project-1');

    expect(variables).toEqual({
      project: {
        cvId: 'cv-1',
        projectId: 'project-1',
      },
    });
  });

  it('checks successful removal response', () => {
    renderHook(() => useRemoveCvProject());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(
      config.isSuccessCheck?.({
        removeCvProject: {
          id: 'cv-1',
          projects: [],
        },
      }),
    ).toBe(true);

    expect(
      config.isSuccessCheck?.({
        removeCvProject: {
          id: '',
          projects: [],
        },
      }),
    ).toBe(false);
  });

  it('returns handleDelete and loading', () => {
    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: true,
    } as never);

    const { result } = renderHook(() => useRemoveCvProject());

    expect(result.current.handleDelete).toBe(handleDelete);

    expect(result.current.loading).toBe(true);
  });
});
