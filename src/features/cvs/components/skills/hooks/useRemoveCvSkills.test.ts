import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE_CV_SKILL_MUTATION } from '@/api/cv-skills';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

import { useRemoveCvSkills } from './useRemoveCvSkills';

vi.mock('@/components/hooks/useDeleteEntity', () => ({
  useDeleteEntity: vi.fn(),
}));

describe('useRemoveCvSkills', () => {
  const handleDelete = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: false,
    } as never);

    handleDelete.mockResolvedValue(true);
  });

  it('configures delete entity hook', () => {
    renderHook(() =>
      useRemoveCvSkills({
        cvId: 'cv-1',
        onSuccess,
      }),
    );

    expect(useDeleteEntity).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: DELETE_CV_SKILL_MUTATION,
        successMessageKey: 'skills.notifications.removeSuccess',
        defaultSuccessMessage: 'Skills removed successfully',
        errorContext: 'Remove CV skills',
        onSuccess,
      }),
    );
  });

  it('builds mutation variables with cvId and skill names', () => {
    renderHook(() =>
      useRemoveCvSkills({
        cvId: 'cv-1',
      }),
    );

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    const variables = config.buildVariables(['React', 'TypeScript']);

    expect(variables).toEqual({
      skill: {
        cvId: 'cv-1',
        name: ['React', 'TypeScript'],
      },
    });
  });

  it('does not call delete when skill list is empty', async () => {
    const { result } = renderHook(() =>
      useRemoveCvSkills({
        cvId: 'cv-1',
      }),
    );

    const success = await result.current.handleRemove([]);

    expect(success).toBe(false);
    expect(handleDelete).not.toHaveBeenCalled();
  });

  it('removes selected skills', async () => {
    const { result } = renderHook(() =>
      useRemoveCvSkills({
        cvId: 'cv-1',
      }),
    );

    const skillNames = ['React', 'TypeScript'];

    const success = await result.current.handleRemove(skillNames);

    expect(handleDelete).toHaveBeenCalledWith(skillNames);
    expect(success).toBe(true);
  });

  it('returns loading state', () => {
    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: true,
    } as never);

    const { result } = renderHook(() =>
      useRemoveCvSkills({
        cvId: 'cv-1',
      }),
    );

    expect(result.current.loading).toBe(true);
  });
});
