import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeUserLanguageModal } from './ChangeUserLanguageModal';
import type { AddUserLanguageFormValues } from '@/lib/validations/language';
import type { ApiLanguage } from '@/api/languages';

const mockHandleSubmit = vi.fn().mockResolvedValue(true);
const mockSetFieldValue = vi.fn();
const mockValidateField = vi.fn().mockReturnValue(true);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'users.languages.language': 'Select Language',
        'users.languages.proficiency': 'Select Proficiency',
        'validation.required': 'Field is required',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

vi.mock('@/components/dialogs/ChangeDialog', () => ({
  ChangeDialog: ({
    children,
    actionTitle,
    itemType,
    onConfirm,
    confirmDisabled,
    trigger,
    open,
    onOpenChange,
    size,
  }: {
    children: React.ReactNode;
    actionTitle: string;
    itemType: string;
    onConfirm: () => Promise<boolean>;
    confirmDisabled: boolean;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    size?: string;
  }) => (
    <div
      data-testid="change-dialog"
      data-action-title={actionTitle}
      data-item-type={itemType}
      data-confirm-disabled={confirmDisabled}
      data-open={open}
      data-size={size}
    >
      {trigger && <div data-testid="dialog-trigger">{trigger}</div>}
      <button
        data-testid="dialog-confirm-button"
        disabled={confirmDisabled}
        onClick={() => void onConfirm()}
      >
        Confirm
      </button>
      <button
        data-testid="dialog-toggle-button"
        onClick={() => onOpenChange?.(!open)}
      >
        Toggle Open
      </button>
      <div data-testid="dialog-content">{children}</div>
    </div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    disabled,
    onValueChange,
    onOpenChange,
  }: {
    children: React.ReactNode;
    value: string;
    disabled?: boolean;
    onValueChange: (value: string) => void;
    onOpenChange: (isOpen: boolean) => void;
  }) => (
    <div
      data-testid="select-component"
      data-value={value}
      data-disabled={disabled}
    >
      <button
        data-testid={`select-change-${value || 'empty'}`}
        onClick={() => onValueChange('German')}
      >
        Change Value
      </button>
      <button
        data-testid="select-close-true"
        onClick={() => onOpenChange(true)}
      >
        Open Select
      </button>
      <button
        data-testid="select-close-false"
        onClick={() => onOpenChange(false)}
      >
        Close Select
      </button>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    label,
    error,
    disabled,
  }: {
    children: React.ReactNode;
    label: string;
    error?: string;
    disabled?: boolean;
  }) => (
    <div
      data-testid={`select-trigger-${label}`}
      data-error={error}
      data-disabled={disabled}
    >
      {children}
      {error && <span data-testid={`error-${label}`}>{error}</span>}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

describe('ChangeUserLanguageModal', () => {
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

  const defaultFormData: AddUserLanguageFormValues = {
    languageName: 'English',
    proficiency: 'Native',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog, selects with correct mapped items, and handle state properly', () => {
    render(
      <ChangeUserLanguageModal
        type="Create"
        languages={sampleLanguages}
        trigger={
          <button data-testid="user-lang-trigger">Add User Language</button>
        }
        open={true}
        onOpenChange={vi.fn()}
        languageDisabled={false}
        formData={defaultFormData}
        errors={{}}
        loading={false}
        isValid={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    const dialog = screen.getByTestId('change-dialog');
    expect(dialog.getAttribute('data-action-title')).toBe('Create');
    expect(dialog.getAttribute('data-item-type')).toBe('language');
    expect(dialog.getAttribute('data-size')).toBe('sm');
    expect(dialog.getAttribute('data-confirm-disabled')).toBe('false');

    expect(screen.getByTestId('user-lang-trigger')).toBeDefined();
    expect(screen.getByTestId('select-item-English')).toBeDefined();
    expect(screen.getByTestId('select-item-German')).toBeDefined();
    expect(screen.getByTestId('select-item-Native')).toBeDefined();
  });

  it('should trigger setFieldValue on language and proficiency selection', () => {
    render(
      <ChangeUserLanguageModal
        type="Update"
        languages={sampleLanguages}
        formData={defaultFormData}
        errors={{}}
        loading={false}
        isValid={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    const changeButtons = screen.getAllByTestId(/select-change-/);
    fireEvent.click(changeButtons[0] as HTMLElement);

    expect(mockSetFieldValue).toHaveBeenCalledWith('languageName', 'German', {
      shouldValidate: true,
    });

    fireEvent.click(changeButtons[1] as HTMLElement);
    expect(mockSetFieldValue).toHaveBeenCalledWith('proficiency', 'German', {
      shouldValidate: true,
    });
  });

  it('should validate both languageName and proficiency fields on select dropdown close and display error messages', () => {
    render(
      <ChangeUserLanguageModal
        type="Create"
        languages={sampleLanguages}
        formData={defaultFormData}
        errors={{
          languageName: 'validation.required',
          proficiency: 'validation.required',
        }}
        loading={false}
        isValid={false}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    expect(screen.getByTestId('error-Select Language').textContent).toBe(
      'Field is required',
    );
    expect(screen.getByTestId('error-Select Proficiency').textContent).toBe(
      'Field is required',
    );

    const closeButtons = screen.getAllByTestId('select-close-false');

    fireEvent.click(closeButtons[0] as HTMLElement);
    expect(mockValidateField).toHaveBeenCalledWith('languageName');

    fireEvent.click(closeButtons[1] as HTMLElement);
    expect(mockValidateField).toHaveBeenCalledWith('proficiency');

    const openButtons = screen.getAllByTestId('select-close-true');
    fireEvent.click(openButtons[0] as HTMLElement);
    expect(mockValidateField).toHaveBeenCalledTimes(2);
  });

  it('should handle confirmation submission and modal toggling', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <ChangeUserLanguageModal
        type="Create"
        languages={sampleLanguages}
        open={false}
        onOpenChange={mockOnOpenChange}
        languageDisabled={true}
        formData={defaultFormData}
        errors={{}}
        loading={false}
        isValid={true}
        setFieldValue={mockSetFieldValue}
        validateField={mockValidateField}
        handleSubmit={mockHandleSubmit}
      />,
    );

    const confirmBtn = screen.getByTestId('dialog-confirm-button');
    fireEvent.click(confirmBtn);
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);

    const toggleBtn = screen.getByTestId('dialog-toggle-button');
    fireEvent.click(toggleBtn);
    expect(mockOnOpenChange).toHaveBeenCalledWith(true);
  });
});
