import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChangeLanguageModal } from './ChangeLanguageModal';
import type { AdminLanguageFormValues } from '@/lib/validations/admin-language';

const mockHandleSubmit = vi.fn().mockResolvedValue(true);
const mockHandleChange = vi.fn().mockReturnValue(() => {});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'languages.admin.name': 'Language Name',
        'languages.admin.iso': 'ISO Code',
        'languages.admin.nativeName': 'Native Name',
        'languages.admin.validation.duplicateName': 'This name already exists',
        'languages.admin.validation.duplicateIso':
          'This ISO code already exists',
        'validation.required': 'Field is required',
        'validation.iso': 'Invalid ISO code',
        'validation.native': 'Invalid native name',
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
  }: {
    children: React.ReactNode;
    actionTitle: string;
    itemType: string;
    onConfirm: () => Promise<boolean>;
    confirmDisabled: boolean;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <div
      data-testid="change-dialog"
      data-action-title={actionTitle}
      data-item-type={itemType}
      data-confirm-disabled={confirmDisabled}
      data-open={open}
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

vi.mock('@/components/ui/input', () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    required,
    maxLength,
    error,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    maxLength?: number;
    error?: string;
  }) => (
    <div data-testid={`input-wrapper-${placeholder}`}>
      <input
        data-testid={`input-${placeholder}`}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
      />
      {error && <span data-testid={`error-${placeholder}`}>{error}</span>}
    </div>
  ),
}));

describe('ChangeLanguageModal', () => {
  const defaultFormData: AdminLanguageFormValues = {
    name: 'Spanish',
    iso2: 'ES',
    nativeName: 'Español',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all inputs, trigger, and dialog container with correct initial state', () => {
    render(
      <ChangeLanguageModal
        type="Create"
        trigger={<button data-testid="custom-trigger">Open Create</button>}
        open={true}
        onOpenChange={vi.fn()}
        formData={defaultFormData}
        errors={{}}
        loading={false}
        duplicateName={false}
        duplicateIso={false}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={true}
      />,
    );

    const dialog = screen.getByTestId('change-dialog');
    expect(dialog.getAttribute('data-action-title')).toBe('Create');
    expect(dialog.getAttribute('data-item-type')).toBe('language');
    expect(dialog.getAttribute('data-confirm-disabled')).toBe('false');
    expect(dialog.getAttribute('data-open')).toBe('true');

    expect(screen.getByTestId('custom-trigger')).toBeDefined();

    const nameInput = screen.getByTestId(
      'input-Language Name',
    ) as HTMLInputElement;
    const isoInput = screen.getByTestId('input-ISO Code') as HTMLInputElement;
    const nativeInput = screen.getByTestId(
      'input-Native Name',
    ) as HTMLInputElement;

    expect(nameInput.value).toBe('Spanish');
    expect(isoInput.value).toBe('ES');
    expect(nativeInput.value).toBe('Español');
    expect(isoInput.maxLength).toBe(2);
  });

  it('should disable confirm button when form is invalid or loading', () => {
    const { rerender } = render(
      <ChangeLanguageModal
        type="Create"
        formData={defaultFormData}
        errors={{}}
        loading={false}
        duplicateName={false}
        duplicateIso={false}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={false}
      />,
    );

    let confirmBtn = screen.getByTestId(
      'dialog-confirm-button',
    ) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    rerender(
      <ChangeLanguageModal
        type="Create"
        formData={defaultFormData}
        errors={{}}
        loading={true}
        duplicateName={false}
        duplicateIso={false}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={true}
      />,
    );

    confirmBtn = screen.getByTestId(
      'dialog-confirm-button',
    ) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);
  });

  it('should format ISO input value to uppercase and restrict length to 2 characters on change', () => {
    render(
      <ChangeLanguageModal
        type="Update"
        formData={defaultFormData}
        errors={{}}
        loading={false}
        duplicateName={false}
        duplicateIso={false}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={true}
      />,
    );

    const isoInput = screen.getByTestId('input-ISO Code');
    fireEvent.change(isoInput, { target: { value: 'de' } });

    expect(mockHandleChange).toHaveBeenCalledWith('iso2');
  });

  it('should display validation errors over duplicate errors for name and iso2, and display duplicate errors when no field validation errors exist', () => {
    const { rerender } = render(
      <ChangeLanguageModal
        type="Create"
        formData={defaultFormData}
        errors={{
          name: 'validation.required',
          iso2: 'validation.iso',
          nativeName: 'validation.native',
        }}
        loading={false}
        duplicateName={true}
        duplicateIso={true}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={false}
      />,
    );

    expect(screen.getByTestId('error-Language Name').textContent).toBe(
      'Field is required',
    );
    expect(screen.getByTestId('error-ISO Code').textContent).toBe(
      'Invalid ISO code',
    );
    expect(screen.getByTestId('error-Native Name').textContent).toBe(
      'Invalid native name',
    );

    rerender(
      <ChangeLanguageModal
        type="Create"
        formData={defaultFormData}
        errors={{}}
        loading={false}
        duplicateName={true}
        duplicateIso={true}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={false}
      />,
    );

    expect(screen.getByTestId('error-Language Name').textContent).toBe(
      'This name already exists',
    );
    expect(screen.getByTestId('error-ISO Code').textContent).toBe(
      'This ISO code already exists',
    );
  });

  it('should invoke handleSubmit and onOpenChange callbacks successfully', () => {
    const mockOnOpenChange = vi.fn();
    render(
      <ChangeLanguageModal
        type="Create"
        open={false}
        onOpenChange={mockOnOpenChange}
        formData={defaultFormData}
        errors={{}}
        loading={false}
        duplicateName={false}
        duplicateIso={false}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        isValid={true}
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
