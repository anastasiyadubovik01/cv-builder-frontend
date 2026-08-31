import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateSkillForm } from './useUpdateSkillForm';
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

describe('useUpdateSkillForm hook', () => {
  const currentSkill: ApiSkill = {
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
  };

  const mockSkills: ApiSkill[] = [
    currentSkill,
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
    result: { current: ReturnType<typeof useUpdateSkillForm> },
    values: { name: string; categoryId: string },
  ) => {
    act(() => {
      result.current.setFieldValue('name', values.name);
      result.current.setFieldValue('categoryId', values.categoryId);
    });
  };

  it('should initialize with provided skill values, loading false, and return translation function', () => {
    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    expect(result.current.formData).toEqual({
      name: 'JavaScript',
      categoryId: '1',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDuplicate).toBe(false);
    expect(typeof result.current.setFieldValue).toBe('function');
    expect(typeof result.current.validateField).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('should validate form and compute isValid status correctly when fields change', () => {
    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    expect(result.current.isValid).toBe(true);

    fillForm(result, {
      name: '',
      categoryId: '',
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.formData).toEqual({
      name: '',
      categoryId: '',
    });

    fillForm(result, {
      name: 'Python',
      categoryId: '1',
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.isDuplicate).toBe(false);
    expect(result.current.formData).toEqual({
      name: 'Python',
      categoryId: '1',
    });
  });

  it('should detect duplicate skill name (case insensitive) excluding current skill', () => {
    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      name: 'JavaScript',
      categoryId: '1',
    });

    expect(result.current.isDuplicate).toBe(false);
    expect(result.current.isValid).toBe(true);

    fillForm(result, {
      name: 'React',
      categoryId: '2',
    });

    expect(result.current.isDuplicate).toBe(true);
    expect(result.current.isValid).toBe(false);

    fillForm(result, {
      name: 'react',
      categoryId: '2',
    });

    expect(result.current.isDuplicate).toBe(true);
    expect(result.current.isValid).toBe(false);

    fillForm(result, {
      name: '  React  ',
      categoryId: '2',
    });

    expect(result.current.isDuplicate).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it('should successfully submit form when data is valid and not duplicate, call mutation, trigger success toast, execute onSuccess callback', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateSkill: {
          id: '1',
          name: 'Python',
          category: {
            id: '1',
            name: 'Programming',
            order: 1,
            parent: null,
          },
          category_name: 'Programming',
          category_parent_name: null,
        },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      name: 'Python',
      categoryId: '1',
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.isDuplicate).toBe(false);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          skillId: '1',
          name: 'Python',
          categoryId: '1',
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'skills.admin.notifications.updateSuccess',
    );
    expect(result.current.formData).toEqual({
      name: 'Python',
      categoryId: '1',
    });
  });

  it('should trim name before checking duplicate and submitting', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateSkill: {
          id: '1',
          name: 'Python',
          category: {
            id: '1',
            name: 'Programming',
            order: 1,
            parent: null,
          },
          category_name: 'Programming',
          category_parent_name: null,
        },
      },
    });

    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      name: '  Python  ',
      categoryId: '1',
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.isDuplicate).toBe(false);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          skillId: '1',
          name: 'Python',
          categoryId: '1',
        },
      },
    });
  });

  it('should return false and not invoke mutation if duplicate skill name exists', async () => {
    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      name: 'React',
      categoryId: '2',
    });

    expect(result.current.isDuplicate).toBe(true);
    expect(result.current.isValid).toBe(false);

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
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      name: '',
      categoryId: '',
    });

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
    const backendError = new Error('Failed to update skill');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      name: 'Python',
      categoryId: '1',
    });

    expect(result.current.isValid).toBe(true);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Update skill',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should allow updating to the same name (not a duplicate)', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateSkill: {
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
      },
    });

    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      name: 'JavaScript',
      categoryId: '1',
    });

    expect(result.current.isDuplicate).toBe(false);
    expect(result.current.isValid).toBe(true);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('should handle updating with different category only', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateSkill: {
          id: '1',
          name: 'JavaScript',
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
      },
    });

    const { result } = renderHook(() =>
      useUpdateSkillForm({
        skill: currentSkill,
        skills: mockSkills,
      }),
    );

    fillForm(result, {
      name: 'JavaScript',
      categoryId: '2',
    });

    expect(result.current.isDuplicate).toBe(false);
    expect(result.current.isValid).toBe(true);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          skillId: '1',
          name: 'JavaScript',
          categoryId: '2',
        },
      },
    });
  });
});
