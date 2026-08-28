import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddUserSkill } from './useAddUserSkill';
import { handleFormError } from '@/lib/error/errorHandler';
import type { ApiSkill } from '@/api/skills';

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

describe('useAddUserSkill hook', () => {
  const testUserId = '123';
  const mockSkills: ApiSkill[] = [
    {
      id: '1',
      name: 'JavaScript',
      category: {
        id: '1',
        name: 'Programming',
        order: 1,
        parent: null,
      },
      category_name: 'Programming',
      category_parent_name: null,
    },
    {
      id: '2',
      name: 'React',
      category: {
        id: '2',
        name: 'Frontend',
        order: 2,
        parent: {
          id: '1',
          name: 'Programming',
        },
      },
      category_name: 'Frontend',
      category_parent_name: 'Programming',
    },
    {
      id: '3',
      name: 'TypeScript',
      category: {
        id: '1',
        name: 'Programming',
        order: 1,
        parent: null,
      },
      category_name: 'Programming',
      category_parent_name: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useAddUserSkill> },
    values: { skillName: string; mastery: string },
  ) => {
    act(() => {
      result.current.setFieldValue('skillName', values.skillName);
      result.current.setFieldValue('mastery', values.mastery);
    });
  };

  it('should initialize with empty form values, loading false, invalid state, and return translation function', () => {
    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
      }),
    );

    expect(result.current.formData).toEqual({
      skillName: '',
      mastery: '',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(typeof result.current.setFieldValue).toBe('function');
    expect(typeof result.current.validateField).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('should validate form and compute isValid status correctly when fields change', () => {
    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
      }),
    );

    expect(result.current.isValid).toBe(false);

    fillForm(result, {
      skillName: 'JavaScript',
      mastery: 'Expert',
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.formData).toEqual({
      skillName: 'JavaScript',
      mastery: 'Expert',
    });
  });

  it('should successfully submit form when data is valid, find selected skill, call mutation, reset form, trigger success toast, execute onSuccess callback', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        addProfileSkill: {
          id: '1',
          skills: [{ name: 'JavaScript', categoryId: '1', mastery: 'Expert' }],
        },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      skillName: 'JavaScript',
      mastery: 'Expert',
    });

    expect(result.current.isValid).toBe(true);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: testUserId,
          name: 'JavaScript',
          categoryId: '1',
          mastery: 'Expert',
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith('skills.addSuccess');
    expect(result.current.formData).toEqual({
      skillName: '',
      mastery: '',
    });
    expect(result.current.errors).toEqual({});
  });

  it('should return false if selected skill is not found in skills list', async () => {
    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      skillName: 'NonExistentSkill',
      mastery: 'Expert',
    });

    expect(result.current.isValid).toBe(true);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should return false and not invoke mutation if form validation fails during submission', async () => {
    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
      }),
    );

    expect(result.current.isValid).toBe(false);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should catch mutation errors and invoke handleFormError properly without triggering success callbacks', async () => {
    const backendError = new Error('Failed to add user skill');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      skillName: 'React',
      mastery: 'Advanced',
    });

    expect(result.current.isValid).toBe(true);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Add user skill',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle skills with category having parent', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        addProfileSkill: {
          id: '2',
          skills: [{ name: 'React', categoryId: '2', mastery: 'Expert' }],
        },
      },
    });

    const { result } = renderHook(() =>
      useAddUserSkill({
        userId: testUserId,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      skillName: 'React',
      mastery: 'Expert',
    });

    expect(result.current.isValid).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          userId: testUserId,
          name: 'React',
          categoryId: '2',
          mastery: 'Expert',
        },
      },
    });
  });
});
