import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DELETE_CV_MUTATION } from '@/api/cvs';
import { useDeleteEntity } from '@/components/hooks/useDeleteEntity';

import { useDeleteCv } from './useDeleteCv';

vi.mock('@/components/hooks/useDeleteEntity', () => ({
  useDeleteEntity: vi.fn(),
}));

describe('useDeleteCv', () => {
  const handleDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: false,
    } as never);
  });

  it('configures delete entity hook for CVs', () => {
    renderHook(() => useDeleteCv());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(config.mutation).toBe(DELETE_CV_MUTATION);

    expect(config.successMessageKey).toBe('cvs.notifications.deleteSuccess');

    expect(config.defaultSuccessMessage).toBe(
      'The CV was successfully deleted!',
    );

    expect(config.errorContext).toBe('Delete CV');
  });

  it('builds correct mutation variables', () => {
    renderHook(() => useDeleteCv());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    const variables = config.buildVariables('cv-123');

    expect(variables).toEqual({
      cv: {
        cvId: 'cv-123',
      },
    });
  });

  it('checks whether CV was successfully deleted', () => {
    renderHook(() => useDeleteCv());

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(
      config.isSuccessCheck?.({
        deleteCv: {
          affected: 1,
        },
      }),
    ).toBe(true);

    expect(
      config.isSuccessCheck?.({
        deleteCv: {
          affected: 0,
        },
      }),
    ).toBe(false);
  });

  it('passes onSuccess callback to delete entity hook', () => {
    const onSuccess = vi.fn();

    renderHook(() =>
      useDeleteCv({
        onSuccess,
      }),
    );

    const config = vi.mocked(useDeleteEntity).mock.calls[0][0];

    expect(config.onSuccess).toBe(onSuccess);
  });

  it('returns handleDelete and loading state', () => {
    vi.mocked(useDeleteEntity).mockReturnValue({
      handleDelete,
      loading: true,
    } as never);

    const { result } = renderHook(() => useDeleteCv());

    expect(result.current.handleDelete).toBe(handleDelete);
    expect(result.current.loading).toBe(true);
  });
});
