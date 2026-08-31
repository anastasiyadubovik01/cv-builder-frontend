import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UpdateLanguageModal } from './UpdateLanguageModal';
import type { ApiLanguage } from '@/api/languages';

const mockFormValues = {
  type: 'Update',
  formData: { name: 'Spanish', iso2: 'ES', nativeName: 'Español' },
  errors: {},
  loading: false,
  duplicateName: false,
  duplicateIso: false,
  isValid: true,
  handleChange: vi.fn(),
  handleSubmit: vi.fn(),
  handleIsoChange: vi.fn(),
};

const mockUseUpdateLanguageForm = vi.fn().mockReturnValue(mockFormValues);

vi.mock('../../hooks/useUpdateLanguageForm', () => ({
  useUpdateLanguageForm: (args: unknown) => mockUseUpdateLanguageForm(args),
}));

vi.mock('./ChangeLanguageModal', () => ({
  ChangeLanguageModal: ({ type, open }: { type: string; open: boolean }) => (
    <div
      data-testid="change-language-modal"
      data-type={type}
      data-open={String(open)}
    />
  ),
}));

describe('UpdateLanguageModal', () => {
  const sampleLanguage: ApiLanguage = {
    id: '1',
    name: 'Spanish',
    iso2: 'ES',
    native_name: 'Español',
    created_at: '2026-01-01T00:00:00.000Z',
  };
  const sampleLanguages: ApiLanguage[] = [sampleLanguage];
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useUpdateLanguageForm with correct arguments and render ChangeLanguageModal with open state', () => {
    render(
      <UpdateLanguageModal
        language={sampleLanguage}
        languages={sampleLanguages}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(mockUseUpdateLanguageForm).toHaveBeenCalledTimes(1);
    expect(mockUseUpdateLanguageForm).toHaveBeenCalledWith({
      language: sampleLanguage,
      languages: sampleLanguages,
      onSuccess: mockOnSuccess,
    });

    const modal = screen.getByTestId('change-language-modal');
    expect(modal.getAttribute('data-type')).toBe('Update');
    expect(modal.getAttribute('data-open')).toBe('true');
  });
});
