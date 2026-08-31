import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddSkillModal } from './AddSkillModal';
import type { ApiSkill } from '@/api/skills';
import React from 'react';

const mockUseAddUserSkill = vi.fn();

vi.mock('@/features/skills/hooks/useAddUserSkill', () => ({
  useAddUserSkill: (args: unknown) => mockUseAddUserSkill(args),
}));

vi.mock('@/features/skills/components/modals/ChangeSkillModal', () => ({
  ChangeSkillModal: ({
    type,
    skills,
    trigger,
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
    trigger: React.ReactNode;
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
      data-loading={String(loading)}
      data-is-valid={String(isValid)}
      data-form-data={JSON.stringify(formData)}
      data-errors={JSON.stringify(errors)}
    >
      <div data-testid="modal-trigger">{trigger}</div>
      <button
        data-testid="modal-set-field-btn"
        onClick={() =>
          setFieldValue('skillName', 'JavaScript', { shouldValidate: true })
        }
      >
        Set Field
      </button>
      <button
        data-testid="modal-validate-btn"
        onClick={() => validateField('skillName')}
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

describe('AddSkillModal', () => {
  const mockSetFieldValue = vi.fn();
  const mockValidateField = vi.fn().mockReturnValue(true);
  const mockHandleSubmit = vi.fn().mockResolvedValue(true);
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAddUserSkill.mockReturnValue({
      formData: { skillName: '', mastery: 'Novice' },
      errors: {},
      loading: false,
      isValid: false,
      setFieldValue: mockSetFieldValue,
      validateField: mockValidateField,
      handleSubmit: mockHandleSubmit,
    });
  });

  it('correctly initializes the hook, passes properties down, and propagates handlers', () => {
    const triggerElement = (
      <button data-testid="custom-trigger">Add Skill</button>
    );

    render(
      <AddSkillModal
        userId="user-123"
        skills={mockSkills}
        trigger={triggerElement}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseAddUserSkill).toHaveBeenCalledWith({
      userId: 'user-123',
      skills: mockSkills,
      onSuccess: mockOnSuccess,
    });

    const modalWrapper = screen.getByTestId('change-skill-modal');
    expect(modalWrapper).toHaveAttribute('data-type', 'Add');
    expect(modalWrapper).toHaveAttribute('data-skills-count', '1');
    expect(modalWrapper).toHaveAttribute('data-loading', 'false');
    expect(modalWrapper).toHaveAttribute('data-is-valid', 'false');
    expect(modalWrapper).toHaveAttribute(
      'data-form-data',
      JSON.stringify({ skillName: '', mastery: 'Novice' }),
    );
    expect(screen.getByTestId('custom-trigger')).toBeDefined();

    fireEvent.click(screen.getByTestId('modal-set-field-btn'));
    expect(mockSetFieldValue).toHaveBeenCalledWith('skillName', 'JavaScript', {
      shouldValidate: true,
    });

    fireEvent.click(screen.getByTestId('modal-validate-btn'));
    expect(mockValidateField).toHaveBeenCalledWith('skillName');

    fireEvent.click(screen.getByTestId('modal-submit-btn'));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
