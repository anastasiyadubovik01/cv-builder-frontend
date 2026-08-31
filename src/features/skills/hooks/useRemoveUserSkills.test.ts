import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRemoveUserSkills } from './useRemoveUserSkills';
import { handleFormError } from '@/lib/error/errorHandler';

const mockMutate = vi.fn();
const mockToastSuccess = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockMutate, { loading: false }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: () => ({
    success: mockToastSuccess,
  }),
}));

vi.mock('@/lib/error/errorHandler', () => ({
  handleFormError: vi.fn(),
}));

describe('useRemoveUserSkills hook', () => {
  const testUserId = '123';
  const testSkillNames = ['JavaScript', 'React', 'TypeScript'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false and return handleRemove function', () => {
    const { result } = renderHook(() =>
      useRemoveUserSkills({ userId: testUserId }),
    );

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleRemove).toBe('function');
  });

  it('should successfully remove skills when handleRemove is called with names', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileSkill: { affected: 3 },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useRemoveUserSkills({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove(testSkillNames);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: testUserId,
          name: testSkillNames,
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith('skills.removeSuccess');
  });

  it('should return false immediately when names array is empty without calling mutation', async () => {
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useRemoveUserSkills({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleRemove([]);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle removing a single skill', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileSkill: { affected: 1 },
      },
    });

    const { result } = renderHook(() =>
      useRemoveUserSkills({ userId: testUserId }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove(['JavaScript']);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: testUserId,
          name: ['JavaScript'],
        },
      },
    });
  });

  it('should catch mutation errors and invoke handleFormError properly', async () => {
    const backendError = new Error('Failed to remove user skills');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useRemoveUserSkills({
        userId: testUserId,
        onSuccess: onSuccessMock,
      }),
    );

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleRemove(testSkillNames);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Remove user skills',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle onSuccess as optional parameter', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileSkill: { affected: 1 },
      },
    });

    const { result } = renderHook(() =>
      useRemoveUserSkills({ userId: testUserId }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove(['Python']);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });

  it('should handle removing multiple skills with empty array in middle', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteProfileSkill: { affected: 2 },
      },
    });

    const { result } = renderHook(() =>
      useRemoveUserSkills({ userId: testUserId }),
    );

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleRemove([]);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();

    await act(async () => {
      successResult = await result.current.handleRemove([
        'React',
        'TypeScript',
      ]);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: testUserId,
          name: ['React', 'TypeScript'],
        },
      },
    });
  });
});
