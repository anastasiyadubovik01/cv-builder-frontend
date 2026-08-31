import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUpdateCvSkill } from './useUpdateCvSkill';
import { handleFormError } from '@/lib/error/errorHandler';
import type { Mastery } from '@/features/skills/types';

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

describe('useUpdateCvSkill hook', () => {
  const testCvId = '123';
  const initialSkillName = 'JavaScript';
  const initialCategoryId = '1';
  const initialMastery = 'Expert' as Mastery;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useUpdateCvSkill> },
    values: { skillName: string; mastery: string },
  ) => {
    act(() => {
      result.current.setFieldValue('skillName', values.skillName);
      result.current.setFieldValue('mastery', values.mastery);
    });
  };

  it('should initialize with provided form values, loading false, and return translation function', () => {
    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: initialSkillName,
        categoryId: initialCategoryId,
        mastery: initialMastery,
      }),
    );

    expect(result.current.formData).toEqual({
      skillName: initialSkillName,
      mastery: initialMastery,
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(typeof result.current.setFieldValue).toBe('function');
    expect(typeof result.current.validateField).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('should validate form and compute isValid status correctly when fields change', () => {
    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: initialSkillName,
        categoryId: initialCategoryId,
        mastery: initialMastery,
      }),
    );

    expect(result.current.isValid).toBe(true);

    fillForm(result, {
      skillName: '',
      mastery: '',
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.formData).toEqual({
      skillName: '',
      mastery: '',
    });

    fillForm(result, {
      skillName: 'React',
      mastery: 'Advanced',
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.formData).toEqual({
      skillName: 'React',
      mastery: 'Advanced',
    });
  });

  it('should successfully submit form when data is valid, call mutation, trigger success toast, execute onSuccess callback, and keep form values', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateCvSkill: {
          id: '1',
          skills: [{ name: 'React', categoryId: '2', mastery: 'Advanced' }],
        },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: initialSkillName,
        categoryId: initialCategoryId,
        mastery: initialMastery,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      skillName: 'React',
      mastery: 'Advanced',
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
          cvId: testCvId,
          name: initialSkillName,
          categoryId: initialCategoryId,
          mastery: 'Advanced',
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith('skills.updateSuccess');
    expect(result.current.formData).toEqual({
      skillName: 'React',
      mastery: 'Advanced',
    });
  });

  it('should handle categoryId as null and omit it from mutation', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        updateCvSkill: {
          id: 'cv-skill-1',
          skills: [{ name: 'JavaScript', categoryId: null, mastery: 'Expert' }],
        },
      },
    });

    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: initialSkillName,
        categoryId: null,
        mastery: initialMastery,
      }),
    );

    fillForm(result, {
      skillName: 'JavaScript',
      mastery: 'Expert',
    });

    expect(result.current.isValid).toBe(true);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        skill: {
          cvId: testCvId,
          name: initialSkillName,
          categoryId: undefined,
          mastery: 'Expert',
        },
      },
    });
  });

  it('should return false and not invoke mutation if form validation fails during submission', async () => {
    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: initialSkillName,
        categoryId: initialCategoryId,
        mastery: initialMastery,
      }),
    );

    fillForm(result, {
      skillName: '',
      mastery: '',
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
    const backendError = new Error('Failed to update CV skill');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: initialSkillName,
        categoryId: initialCategoryId,
        mastery: initialMastery,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, {
      skillName: 'TypeScript',
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
      context: 'Update CV skill',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should handle empty initial values correctly', () => {
    const { result } = renderHook(() =>
      useUpdateCvSkill({
        cvId: testCvId,
        skillName: '',
        categoryId: null,
        mastery: '' as Mastery,
      }),
    );

    expect(result.current.formData).toEqual({
      skillName: '',
      mastery: '',
    });
    expect(result.current.isValid).toBe(false);
  });
});
