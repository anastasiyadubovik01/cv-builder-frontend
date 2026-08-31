import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateSkillAdminModal } from './CreateSkillAdminModal';
import type { ApiSkill } from '@/api/skills';
import type { SkillFormCategory } from '@/features/skills/components/modals/ChangeSkillAdminModal';
import React from 'react';

const mockUseCreateSkillForm = vi.fn();

vi.mock('@/features/skills/hooks/useCreateSkillForm', () => ({
  useCreateSkillForm: (args: unknown) => mockUseCreateSkillForm(args),
}));

vi.mock('@/features/skills/components/modals/ChangeSkillAdminModal', () => ({
  ChangeSkillAdminModal: ({
    type,
    categories,
    trigger,
    formData,
    errors,
    loading,
    isValid,
    isDuplicate,
    setFieldValue,
    validateField,
    handleSubmit,
  }: {
    type: string;
    categories: SkillFormCategory[];
    trigger: React.ReactNode;
    formData: Record<string, unknown>;
    errors: Record<string, string>;
    loading: boolean;
    isValid: boolean;
    isDuplicate: boolean;
    setFieldValue: (field: string, value: unknown, options?: unknown) => void;
    validateField: (field: string) => boolean;
    handleSubmit: () => Promise<boolean>;
  }) => (
    <div
      data-testid="change-skill-admin-modal"
      data-type={type}
      data-categories-count={categories.length}
      data-loading={String(loading)}
      data-is-valid={String(isValid)}
      data-is-duplicate={String(isDuplicate)}
      data-form-data={JSON.stringify(formData)}
      data-errors={JSON.stringify(errors)}
    >
      <div data-testid="admin-modal-trigger">{trigger}</div>
      <button
        data-testid="admin-modal-set-field-btn"
        onClick={() => setFieldValue('name', 'TypeScript')}
      >
        Set Admin Field
      </button>
      <button
        data-testid="admin-modal-validate-btn"
        onClick={() => validateField('name')}
      >
        Validate Admin Field
      </button>
      <button
        data-testid="admin-modal-submit-btn"
        onClick={() => void handleSubmit()}
      >
        Submit Admin Form
      </button>
    </div>
  ),
}));

const mockSkills: ApiSkill[] = [
  {
    id: '1',
    name: 'JavaScript',
    category: {
      id: '1',
      name: 'Programming',
      order: 1,
      parent: { id: '1', name: 'Languages' },
    },
    category_name: 'Programming',
    category_parent_name: 'Languages',
  },
];

const mockCategories: SkillFormCategory[] = [
  { id: '1', name: 'Frontend' },
  { id: '2', name: 'Backend' },
];

describe('CreateSkillAdminModal', () => {
  const mockSetFieldValue = vi.fn();
  const mockValidateField = vi.fn().mockReturnValue(true);
  const mockHandleSubmit = vi.fn().mockResolvedValue(true);
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateSkillForm.mockReturnValue({
      formData: { name: '', categoryId: '' },
      errors: {},
      loading: false,
      isValid: false,
      isDuplicate: false,
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
      handleSubmit: mockHandleSubmit,
    });
  });

  it('correctly initializes the create skill form hook, passes category options down, and maps interactions', () => {
    const triggerElement = (
      <button data-testid="admin-custom-trigger">Create Skill Admin</button>
    );

    render(
      <CreateSkillAdminModal
        skills={mockSkills}
        categories={mockCategories}
        trigger={triggerElement}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseCreateSkillForm).toHaveBeenCalledWith({
      skills: mockSkills,
      onSuccess: mockOnSuccess,
    });

    const modalWrapper = screen.getByTestId('change-skill-admin-modal');
    expect(modalWrapper).toHaveAttribute('data-type', 'Create');
    expect(modalWrapper).toHaveAttribute('data-categories-count', '2');
    expect(modalWrapper).toHaveAttribute('data-loading', 'false');
    expect(modalWrapper).toHaveAttribute('data-is-valid', 'false');
    expect(modalWrapper).toHaveAttribute('data-is-duplicate', 'false');
    expect(modalWrapper).toHaveAttribute(
      'data-form-data',
      JSON.stringify({ name: '', categoryId: '' }),
    );
    expect(screen.getByTestId('admin-custom-trigger')).toBeDefined();

    fireEvent.click(screen.getByTestId('admin-modal-set-field-btn'));
    expect(mockSetFieldValue).toHaveBeenCalledWith('name', 'TypeScript');

    fireEvent.click(screen.getByTestId('admin-modal-validate-btn'));
    expect(mockValidateField).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByTestId('admin-modal-submit-btn'));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
