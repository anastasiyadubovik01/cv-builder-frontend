import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeleteSkill } from './useDeleteSkill';
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

describe('useDeleteSkill hook', () => {
  const testSkillId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading false and return handleDelete function', () => {
    const { result } = renderHook(() => useDeleteSkill());

    expect(result.current.loading).toBe(false);
    expect(typeof result.current.handleDelete).toBe('function');
  });

  it('should successfully delete skill when handleDelete is called', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteSkill: { affected: 1 },
      },
    });

    const { result } = renderHook(() => useDeleteSkill());

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleDelete(testSkillId);
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: { skillId: testSkillId },
      },
    });
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'skills.admin.notifications.deleteSuccess',
    );
  });

  it('should catch mutation errors and invoke handleFormError properly', async () => {
    const backendError = new Error('Failed to delete skill');
    mockMutate.mockRejectedValueOnce(backendError);

    const { result } = renderHook(() => useDeleteSkill());

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleDelete(testSkillId);
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Delete skill',
    });
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle mutation options correctly', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        deleteSkill: { affected: 1 },
      },
    });

    const { result } = renderHook(() => useDeleteSkill());

    await act(async () => {
      await result.current.handleDelete(testSkillId);
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: { skillId: testSkillId },
      },
    });
  });
});
