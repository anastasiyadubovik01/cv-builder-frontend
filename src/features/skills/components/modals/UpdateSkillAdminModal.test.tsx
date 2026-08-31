import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpdateSkillAdminModal } from './UpdateSkillAdminModal';
import type { ApiSkill } from '@/api/skills';
import type { SkillFormCategory } from '@/features/skills/components/modals/ChangeSkillAdminModal';
import React from 'react';

const mockUseUpdateSkillForm = vi.fn();

vi.mock('@/features/skills/hooks/useUpdateSkillForm', () => ({
  useUpdateSkillForm: (args: unknown) => mockUseUpdateSkillForm(args),
}));

vi.mock('@/features/skills/components/modals/ChangeSkillAdminModal', () => ({
  ChangeSkillAdminModal: ({
    type,
    categories,
    open,
    onOpenChange,
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
      data-open={String(open)}
      data-loading={String(loading)}
      data-is-valid={String(isValid)}
      data-is-duplicate={String(isDuplicate)}
      data-form-data={JSON.stringify(formData)}
      data-errors={JSON.stringify(errors)}
    >
      <button
        data-testid="admin-modal-toggle"
        onClick={() => onOpenChange(!open)}
      >
        Toggle Modal
      </button>
      <button
        data-testid="admin-modal-set-field-btn"
        onClick={() => setFieldValue('name', 'Updated Skill')}
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

const mockSkill: ApiSkill = {
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
};

const mockSkills: ApiSkill[] = [mockSkill];

const mockCategories: SkillFormCategory[] = [
  { id: '1', name: 'Frontend' },
  { id: '2', name: 'Backend' },
];

describe('UpdateSkillAdminModal', () => {
  const mockSetFieldValue = vi.fn();
  const mockValidateField = vi.fn().mockReturnValue(true);
  const mockHandleSubmit = vi.fn().mockResolvedValue(true);
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateSkillForm.mockReturnValue({
      formData: { name: 'JavaScript', categoryId: '1' },
      errors: {},
      loading: false,
      isValid: true,
      isDuplicate: false,
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
      handleSubmit: mockHandleSubmit,
    });
  });

  it('correctly initializes the update skill form hook, passes props down, and handles events', () => {
    render(
      <UpdateSkillAdminModal
        skill={mockSkill}
        skills={mockSkills}
        categories={mockCategories}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseUpdateSkillForm).toHaveBeenCalledWith({
      skill: mockSkill,
      skills: mockSkills,
      onSuccess: mockOnSuccess,
    });

    const modalWrapper = screen.getByTestId('change-skill-admin-modal');
    expect(modalWrapper).toHaveAttribute('data-type', 'Update');
    expect(modalWrapper).toHaveAttribute('data-categories-count', '2');
    expect(modalWrapper).toHaveAttribute('data-open', 'true');
    expect(modalWrapper).toHaveAttribute('data-loading', 'false');
    expect(modalWrapper).toHaveAttribute('data-is-valid', 'true');
    expect(modalWrapper).toHaveAttribute('data-is-duplicate', 'false');
    expect(modalWrapper).toHaveAttribute(
      'data-form-data',
      JSON.stringify({ name: 'JavaScript', categoryId: '1' }),
    );

    fireEvent.click(screen.getByTestId('admin-modal-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByTestId('admin-modal-set-field-btn'));
    expect(mockSetFieldValue).toHaveBeenCalledWith('name', 'Updated Skill');

    fireEvent.click(screen.getByTestId('admin-modal-validate-btn'));
    expect(mockValidateField).toHaveBeenCalledWith('name');

    fireEvent.click(screen.getByTestId('admin-modal-submit-btn'));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
