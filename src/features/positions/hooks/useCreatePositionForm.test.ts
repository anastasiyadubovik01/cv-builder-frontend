import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreatePositionForm } from './useCreatePositionForm';
import { handleFormError } from '@/lib/error/errorHandler';
import type { Position } from '@/api/positions';

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

describe('useCreatePositionForm hook', () => {
  const mockPositions: Position[] = [
    {
      id: '1',
      name: 'Systems Analyst',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'UX Designer',
      created_at: '2026-01-02T00:00:00Z',
    },
    {
      id: '3',
      name: 'QA Engineer',
      created_at: '2026-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillForm = (
    result: { current: ReturnType<typeof useCreatePositionForm> },
    name: string,
  ) => {
    act(() => {
      const event = {
        target: { value: name },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange('name')(event);
    });
  };

  it('should initialize with empty form values, loading false, duplicateName false and return translation function', () => {
    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
      }),
    );

    expect(result.current.formData).toEqual({
      name: '',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.duplicateName).toBe(false);
    expect(typeof result.current.handleChange).toBe('function');
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.t).toBe('function');
  });

  it('should update form data when handleChange is called', () => {
    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
      }),
    );

    fillForm(result, 'Network Engineer');

    expect(result.current.formData).toEqual({
      name: 'Network Engineer',
    });
  });

  it('should detect duplicate position name (case insensitive)', () => {
    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
      }),
    );

    fillForm(result, 'Systems Analyst');
    expect(result.current.duplicateName).toBe(true);

    fillForm(result, 'Systems Analyst');
    expect(result.current.duplicateName).toBe(true);

    fillForm(result, '  Systems Analyst  ');
    expect(result.current.duplicateName).toBe(true);

    fillForm(result, 'Network Engineer');
    expect(result.current.duplicateName).toBe(false);
  });

  it('should successfully submit form when data is valid and not duplicate, call mutation, reset form, trigger success toast, execute onSuccess callback', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        createPosition: {
          id: '4',
          name: 'Network Engineer',
          created_at: '2026-01-04T00:00:00Z',
        },
      },
    });
    const onSuccessMock = vi.fn();

    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, 'Network Engineer');

    expect(result.current.duplicateName).toBe(false);

    let successResult = false;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(true);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        position: {
          name: 'Network Engineer',
        },
      },
    });
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'positions.notifications.createSuccess',
    );
    expect(result.current.formData).toEqual({
      name: '',
    });
  });

  it('should trim name before checking duplicate and submitting', async () => {
    mockMutate.mockResolvedValueOnce({
      data: {
        createPosition: {
          id: '4',
          name: 'Network Engineer',
          created_at: '2026-01-04T00:00:00Z',
        },
      },
    });

    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
      }),
    );

    fillForm(result, '  Network Engineer  ');

    expect(result.current.duplicateName).toBe(false);

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockMutate).toHaveBeenCalledWith({
      variables: {
        position: {
          name: 'Network Engineer',
        },
      },
    });
  });

  it('should return false and not invoke mutation if duplicate name exists', async () => {
    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
      }),
    );

    fillForm(result, 'Systems Analyst');

    expect(result.current.duplicateName).toBe(true);

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
      useCreatePositionForm({
        positions: mockPositions,
      }),
    );

    fillForm(result, '');

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  it('should catch mutation errors and invoke handleFormError properly without triggering success callbacks', async () => {
    const backendError = new Error('Failed to create position');
    mockMutate.mockRejectedValueOnce(backendError);

    const onSuccessMock = vi.fn();
    const { result } = renderHook(() =>
      useCreatePositionForm({
        positions: mockPositions,
        onSuccess: onSuccessMock,
      }),
    );

    fillForm(result, 'Network Engineer');

    expect(result.current.duplicateName).toBe(false);

    let successResult = true;
    await act(async () => {
      successResult = await result.current.handleSubmit();
    });

    expect(successResult).toBe(false);
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledTimes(1);
    expect(handleFormError).toHaveBeenCalledWith(backendError, {
      t: mockT,
      context: 'Create Position',
    });
    expect(onSuccessMock).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
