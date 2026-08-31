import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateLanguageModal } from './CreateLanguageModal';
import type { ApiLanguage } from '@/api/languages';

const mockFormValues = {
  type: 'Create',
  formData: { name: '', iso2: '', nativeName: '' },
  errors: {},
  loading: false,
  duplicateName: false,
  duplicateIso: false,
  isValid: false,
  handleChange: vi.fn(),
  handleSubmit: vi.fn(),
  handleIsoChange: vi.fn(),
};

const mockUseCreateLanguageForm = vi.fn().mockReturnValue(mockFormValues);

vi.mock('../../hooks/useCreateLanguageForm', () => ({
  useCreateLanguageForm: (args: unknown) => mockUseCreateLanguageForm(args),
}));

vi.mock('./ChangeLanguageModal', () => ({
  ChangeLanguageModal: ({
    type,
    trigger,
  }: {
    type: string;
    trigger: React.ReactNode;
  }) => (
    <div data-testid="change-language-modal" data-type={type}>
      {trigger && <div data-testid="modal-trigger">{trigger}</div>}
    </div>
  ),
}));

describe('CreateLanguageModal', () => {
  const sampleLanguages: ApiLanguage[] = [
    {
      id: '1',
      name: 'English',
      iso2: 'en',
      native_name: 'English',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useCreateLanguageForm with correct arguments and render ChangeLanguageModal', () => {
    render(
      <CreateLanguageModal
        languages={sampleLanguages}
        trigger={<button data-testid="create-trigger">Open Create</button>}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseCreateLanguageForm).toHaveBeenCalledTimes(1);
    expect(mockUseCreateLanguageForm).toHaveBeenCalledWith({
      languages: sampleLanguages,
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-language-modal');
    expect(modal.getAttribute('data-type')).toBe('Create');
    expect(screen.getByTestId('modal-trigger')).toBeDefined();
  });
});
