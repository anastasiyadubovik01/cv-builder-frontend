import { act, renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import type { DocumentNode } from 'graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useToast } from '@/components/ui/sonner';
import { handleFormError } from '@/lib/error/errorHandler';

import { useDeleteEntity } from './useDeleteEntity';

vi.mock('@apollo/client/react', () => ({
  useMutation: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: vi.fn(),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

type MutationData = {
  deleteProject: boolean;
};

type MutationVariables = {
  id: string;
};

const mutation = {} as DocumentNode;

describe('useDeleteEntity', () => {
  const mutate = vi.fn();
  const success = vi.fn();
  const t = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMutation).mockReturnValue([
      mutate,
      { loading: false },
    ] as never);

    vi.mocked(useTranslation).mockReturnValue({
      t,
    } as never);

    vi.mocked(useToast).mockReturnValue({
      success,
    } as never);

    t.mockImplementation((key: string) => key);
  });

  it('calls mutation with built variables and returns true on success', async () => {
    mutate.mockResolvedValue({
      data: {
        deleteProject: true,
      },
    });

    const buildVariables = vi.fn((id: string) => ({ id }));

    const { result } = renderHook(() =>
      useDeleteEntity<MutationData, MutationVariables, [string]>({
        mutation,
        successMessageKey: 'projectDeleted',
        errorContext: 'deleteProject',
        buildVariables,
        onSuccess,
      }),
    );

    let deleteResult: boolean | undefined;

    await act(async () => {
      deleteResult = await result.current.handleDelete('123');
    });

    expect(buildVariables).toHaveBeenCalledWith('123');

    expect(mutate).toHaveBeenCalledWith({
      variables: {
        id: '123',
      },
    });

    expect(success).toHaveBeenCalledWith('projectDeleted');
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(deleteResult).toBe(true);
  });

  it('uses default success message when it is provided', async () => {
    mutate.mockResolvedValue({
      data: {
        deleteProject: true,
      },
    });

    t.mockImplementation(
      (key: string, defaultValue?: string) => defaultValue ?? key,
    );

    const { result } = renderHook(() =>
      useDeleteEntity<MutationData, MutationVariables, [string]>({
        mutation,
        successMessageKey: 'projectDeleted',
        defaultSuccessMessage: 'Project deleted',
        errorContext: 'deleteProject',
        buildVariables: (id) => ({ id }),
      }),
    );

    await act(async () => {
      await result.current.handleDelete('123');
    });

    expect(t).toHaveBeenCalledWith('projectDeleted', 'Project deleted');
    expect(success).toHaveBeenCalledWith('Project deleted');
  });

  it('returns false when success check fails', async () => {
    mutate.mockResolvedValue({
      data: {
        deleteProject: false,
      },
    });

    const { result } = renderHook(() =>
      useDeleteEntity<MutationData, MutationVariables, [string]>({
        mutation,
        successMessageKey: 'projectDeleted',
        errorContext: 'deleteProject',
        buildVariables: (id) => ({ id }),
        isSuccessCheck: (data) => Boolean(data?.deleteProject),
        onSuccess,
      }),
    );

    let deleteResult: boolean | undefined;

    await act(async () => {
      deleteResult = await result.current.handleDelete('123');
    });

    expect(deleteResult).toBe(false);
    expect(success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('handles mutation error and returns false', async () => {
    const error = new Error('Delete failed');

    mutate.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useDeleteEntity<MutationData, MutationVariables, [string]>({
        mutation,
        successMessageKey: 'projectDeleted',
        errorContext: 'deleteProject',
        buildVariables: (id) => ({ id }),
      }),
    );

    let deleteResult: boolean | undefined;

    await act(async () => {
      deleteResult = await result.current.handleDelete('123');
    });

    expect(handleFormError).toHaveBeenCalledWith(error, {
      t,
      context: 'deleteProject',
    });

    expect(deleteResult).toBe(false);
    expect(success).not.toHaveBeenCalled();
  });

  it('returns mutation loading state', () => {
    vi.mocked(useMutation).mockReturnValue([
      mutate,
      { loading: true },
    ] as never);

    const { result } = renderHook(() =>
      useDeleteEntity<MutationData, MutationVariables, [string]>({
        mutation,
        successMessageKey: 'projectDeleted',
        errorContext: 'deleteProject',
        buildVariables: (id) => ({ id }),
      }),
    );

    expect(result.current.loading).toBe(true);
  });
});
