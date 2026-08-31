import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpdateSkillModal } from './UpdateSkillModal';
import type { ApiSkill, ProfileSkill } from '@/api/skills';
import React from 'react';

const mockUseUpdateUserSkill = vi.fn();

vi.mock('@/features/skills/hooks/useUpdateUserSkill', () => ({
  useUpdateUserSkill: (args: unknown) => mockUseUpdateUserSkill(args),
}));

vi.mock('@/features/skills/components/modals/ChangeSkillModal', () => ({
  ChangeSkillModal: ({
    type,
    skills,
    open,
    onOpenChange,
    skillDisabled,
    formData,
    errors,
    loading,
    isValid,
    setFieldValue,
    validateField,
    handleSubmit,
  }: {
    type: string;
    skills: ApiSkill[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    skillDisabled?: boolean;
    formData: Record<string, unknown>;
    errors: Record<string, string>;
    loading: boolean;
    isValid: boolean;
    setFieldValue: (field: string, value: unknown, options?: unknown) => void;
    validateField: (field: string) => boolean;
    handleSubmit: () => Promise<boolean>;
  }) => (
    <div
      data-testid="change-skill-modal"
      data-type={type}
      data-skills-count={skills.length}
      data-open={String(open)}
      data-skill-disabled={String(skillDisabled)}
      data-loading={String(loading)}
      data-is-valid={String(isValid)}
      data-form-data={JSON.stringify(formData)}
      data-errors={JSON.stringify(errors)}
    >
      <button data-testid="modal-toggle" onClick={() => onOpenChange(!open)}>
        Toggle Modal
      </button>
      <button
        data-testid="modal-set-field-btn"
        onClick={() => setFieldValue('mastery', 'Advanced')}
      >
        Set Field
      </button>
      <button
        data-testid="modal-validate-btn"
        onClick={() => validateField('mastery')}
      >
        Validate Field
      </button>
      <button
        data-testid="modal-submit-btn"
        onClick={() => void handleSubmit()}
      >
        Submit Form
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

const mockProfileSkill: ProfileSkill = {
  name: 'JavaScript',
  categoryId: '1',
  mastery: 'Proficient',
};

describe('UpdateSkillModal', () => {
  const mockSetFieldValue = vi.fn();
  const mockValidateField = vi.fn().mockReturnValue(true);
  const mockHandleSubmit = vi.fn().mockResolvedValue(true);
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUpdateUserSkill.mockReturnValue({
      formData: { skillName: 'JavaScript', mastery: 'Intermediate' },
      errors: {},
      loading: false,
      isValid: true,
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
      handleSubmit: mockHandleSubmit,
    });
  });

  it('correctly initializes the update user skill hook, passes correct configuration down, and propagates callbacks', () => {
    render(
      <UpdateSkillModal
        userId="user-123"
        skill={mockProfileSkill}
        skills={mockSkills}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseUpdateUserSkill).toHaveBeenCalledWith({
      userId: 'user-123',
      skillName: mockProfileSkill.name,
      categoryId: mockProfileSkill.categoryId,
      mastery: mockProfileSkill.mastery,
      onSuccess: mockOnSuccess,
    });

    const modalWrapper = screen.getByTestId('change-skill-modal');
    expect(modalWrapper).toHaveAttribute('data-type', 'Update');
    expect(modalWrapper).toHaveAttribute('data-skills-count', '1');
    expect(modalWrapper).toHaveAttribute('data-open', 'true');
    expect(modalWrapper).toHaveAttribute('data-skill-disabled', 'true');
    expect(modalWrapper).toHaveAttribute('data-loading', 'false');
    expect(modalWrapper).toHaveAttribute('data-is-valid', 'true');
    expect(modalWrapper).toHaveAttribute(
      'data-form-data',
      JSON.stringify({ skillName: 'JavaScript', mastery: 'Intermediate' }),
    );

    fireEvent.click(screen.getByTestId('modal-toggle'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByTestId('modal-set-field-btn'));
    expect(mockSetFieldValue).toHaveBeenCalledWith('mastery', 'Advanced');

    fireEvent.click(screen.getByTestId('modal-validate-btn'));
    expect(mockValidateField).toHaveBeenCalledWith('mastery');

    fireEvent.click(screen.getByTestId('modal-submit-btn'));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
