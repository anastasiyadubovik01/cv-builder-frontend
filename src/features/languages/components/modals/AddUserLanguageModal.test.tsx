import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AddUserLanguageModal } from './AddUserLanguageModal';
import type { ApiLanguage } from '@/api/languages';

const mockFormValues = {
  formData: { languageName: '', proficiency: '' },
  errors: {},
  loading: false,
  isValid: false,
  setFieldValue: vi.fn(),
  validateField: vi.fn(),
  handleSubmit: vi.fn(),
  languageDisabled: false,
};

const mockUseAddUserLanguage = vi.fn().mockReturnValue(mockFormValues);

vi.mock('@/features/languages/hooks/useAddUserLanguage', () => ({
  useAddUserLanguage: (args: unknown) => mockUseAddUserLanguage(args),
}));

vi.mock(
  '@/features/languages/components/modals/ChangeUserLanguageModal',
  () => ({
    ChangeUserLanguageModal: ({
      type,
      languages,
      trigger,
    }: {
      type: string;
      languages: ApiLanguage[];
      trigger: React.ReactNode;
    }) => (
      <div
        data-testid="change-user-language-modal"
        data-type={type}
        data-lang-count={languages.length}
      >
        {trigger && <div data-testid="user-modal-trigger">{trigger}</div>}
      </div>
    ),
  }),
);

describe('AddUserLanguageModal', () => {
  const sampleLanguages: ApiLanguage[] = [
    {
      id: '1',
      name: 'English',
      iso2: 'en',
      native_name: 'English',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'German',
      iso2: 'de',
      native_name: 'Deutsch',
      created_at: '2026-01-01T00:00:00.000Z',
    },
  ];
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useAddUserLanguage with correct arguments and render ChangeUserLanguageModal with type Add', () => {
    render(
      <AddUserLanguageModal
        userId="123"
        languages={sampleLanguages}
        trigger={<button data-testid="add-user-trigger">Add Language</button>}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseAddUserLanguage).toHaveBeenCalledTimes(1);
    expect(mockUseAddUserLanguage).toHaveBeenCalledWith({
      userId: '123',
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-user-language-modal');
    expect(modal.getAttribute('data-type')).toBe('Add');
    expect(modal.getAttribute('data-lang-count')).toBe('2');
    expect(screen.getByTestId('user-modal-trigger')).toBeDefined();
  });
});
