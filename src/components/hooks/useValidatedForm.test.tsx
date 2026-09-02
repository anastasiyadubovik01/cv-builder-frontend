import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useValidatedForm } from './useValidatedForm';

type FormData = {
  name: string;
  email: string;
};

describe('useValidatedForm', () => {
  const initialValues: FormData = {
    name: '',
    email: '',
  };

  const safeParse = vi.fn();

  const schema = {
    safeParse,
  } as never;

  beforeEach(() => {
    vi.clearAllMocks();

    safeParse.mockReturnValue({
      success: true,
      data: initialValues,
    });
  });

  it('returns initial form state', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    expect(result.current.formData).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitted).toBe(false);
  });

  it('validates valid form successfully', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    let isValid!: boolean;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(true);
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.errors).toEqual({});
    expect(safeParse).toHaveBeenCalledWith(initialValues);
  });

  it('sets field errors when form is invalid', () => {
    safeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ['name'],
            message: 'Name is required',
          },
          {
            path: ['email'],
            message: 'Email is required',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    let isValid!: boolean;

    act(() => {
      isValid = result.current.validateForm();
    });

    expect(isValid).toBe(false);

    expect(result.current.errors).toEqual({
      name: 'Name is required',
      email: 'Email is required',
    });
  });

  it('keeps only first error for the same field', () => {
    safeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ['name'],
            message: 'First error',
          },
          {
            path: ['name'],
            message: 'Second error',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.validateForm();
    });

    expect(result.current.errors.name).toBe('First error');
  });

  it('ignores issues with invalid or unknown paths', () => {
    safeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: [0],
            message: 'Invalid path',
          },
          {
            path: ['unknown'],
            message: 'Unknown field',
          },
          {
            path: ['name'],
            message: 'Name error',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.validateForm();
    });

    expect(result.current.errors).toEqual({
      name: 'Name error',
    });
  });

  it('updates field without validation before submit', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.setFieldValue('name', 'Nastya');
    });

    expect(result.current.formData.name).toBe('Nastya');
    expect(safeParse).not.toHaveBeenCalled();
  });

  it('validates field when shouldValidate is true', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.setFieldValue('name', 'Nastya', {
        shouldValidate: true,
      });
    });

    expect(result.current.formData.name).toBe('Nastya');

    expect(safeParse).toHaveBeenCalledWith({
      name: 'Nastya',
      email: '',
    });
  });

  it('automatically validates changed fields after form submit', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.validateForm();
    });

    safeParse.mockClear();

    act(() => {
      result.current.setFieldValue('name', 'Nastya');
    });

    expect(safeParse).toHaveBeenCalledWith({
      name: 'Nastya',
      email: '',
    });
  });

  it('sets field error when field validation fails', () => {
    safeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ['name'],
            message: 'Name is invalid',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    let isValid!: boolean;

    act(() => {
      isValid = result.current.validateField('name');
    });

    expect(isValid).toBe(false);

    expect(result.current.errors).toEqual({
      name: 'Name is invalid',
    });
  });

  it('removes existing field error when field becomes valid', () => {
    safeParse.mockReturnValueOnce({
      success: false,
      error: {
        issues: [
          {
            path: ['name'],
            message: 'Name is invalid',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.validateField('name');
    });

    expect(result.current.errors.name).toBe('Name is invalid');

    safeParse.mockReturnValue({
      success: true,
      data: initialValues,
    });

    let isValid!: boolean;

    act(() => {
      isValid = result.current.validateField('name');
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('keeps errors unchanged when valid field has no error', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.setErrors({
        email: 'Email error',
      });
    });

    act(() => {
      result.current.validateField('name');
    });

    expect(result.current.errors).toEqual({
      email: 'Email error',
    });
  });

  it('removes field error when schema fails for another field', () => {
    safeParse.mockReturnValueOnce({
      success: false,
      error: {
        issues: [
          {
            path: ['name'],
            message: 'Name error',
          },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.validateField('name');
    });

    expect(result.current.errors.name).toBe('Name error');

    safeParse.mockReturnValue({
      success: false,
      error: {
        issues: [
          {
            path: ['email'],
            message: 'Email error',
          },
        ],
      },
    });

    let isValid!: boolean;

    act(() => {
      isValid = result.current.validateField('name');
    });

    expect(isValid).toBe(true);
    expect(result.current.errors.name).toBeUndefined();
  });

  it('validates provided updated data', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    const updatedData = {
      name: 'Nastya',
      email: 'test@example.com',
    };

    act(() => {
      result.current.validateField('name', updatedData);
    });

    expect(safeParse).toHaveBeenCalledWith(updatedData);
  });

  it('handleChange updates field value', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.handleChange('name')({
        target: {
          value: 'Nastya',
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.name).toBe('Nastya');
  });

  it('clears all errors', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.setErrors({
        name: 'Name error',
        email: 'Email error',
      });
    });

    expect(result.current.errors).toEqual({
      name: 'Name error',
      email: 'Email error',
    });

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it('allows isSubmitted to be changed manually', () => {
    const { result } = renderHook(() =>
      useValidatedForm({
        initialValues,
        schema,
      }),
    );

    act(() => {
      result.current.setIsSubmitted(true);
    });

    expect(result.current.isSubmitted).toBe(true);
  });
});
