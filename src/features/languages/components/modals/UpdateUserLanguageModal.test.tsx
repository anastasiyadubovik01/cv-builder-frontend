import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdateUserLanguageModal } from './UpdateUserLanguageModal';
import type { ApiLanguage, ProfileLanguage } from '@/api/languages';

const mockFormValues = {
  formData: { languageName: 'English', proficiency: 'Native' },
  errors: {},
  loading: false,
  isValid: true,
  setFieldValue: vi.fn(),
  validateField: vi.fn(),
  handleSubmit: vi.fn(),
  languageDisabled: true,
};

const mockUseUpdateUserLanguage = vi.fn().mockReturnValue(mockFormValues);

vi.mock('@/features/languages/hooks/useUpdateUserLanguage', () => ({
  useUpdateUserLanguage: (args: unknown) => mockUseUpdateUserLanguage(args),
}));

vi.mock(
  '@/features/languages/components/modals/ChangeUserLanguageModal',
  () => ({
    ChangeUserLanguageModal: ({
      type,
      languages,
      open,
      languageDisabled,
    }: {
      type: string;
      languages: ApiLanguage[];
      open: boolean;
      languageDisabled?: boolean;
    }) => (
      <div
        data-testid="change-user-language-modal"
        data-type={type}
        data-lang-count={languages.length}
        data-open={String(open)}
        data-lang-disabled={String(languageDisabled)}
      />
    ),
  }),
);

describe('UpdateUserLanguageModal', () => {
  const sampleProfileLanguage: ProfileLanguage = {
    name: 'English',
    proficiency: 'Native',
  };
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
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useUpdateUserLanguage with mapped profile language parameters and render ChangeUserLanguageModal properly', () => {
    render(
      <UpdateUserLanguageModal
        userId="123"
        language={sampleProfileLanguage}
        languages={sampleLanguages}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseUpdateUserLanguage).toHaveBeenCalledTimes(1);
    expect(mockUseUpdateUserLanguage).toHaveBeenCalledWith({
      userId: '123',
      languageName: 'English',
      proficiency: 'Native',
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-user-language-modal');
    expect(modal.getAttribute('data-type')).toBe('Update');
    expect(modal.getAttribute('data-lang-count')).toBe('1');
    expect(modal.getAttribute('data-open')).toBe('true');
    expect(modal.getAttribute('data-lang-disabled')).toBe('true');
  });
});
