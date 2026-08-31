import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsContent } from './SettingsContent';

const mockHandleThemeChange = vi.fn();
const mockHandleLanguageChange = vi.fn();
const mockUseSettings = vi.fn();

vi.mock('@/features/settings/hooks/useSettings', () => ({
  useSettings: () => mockUseSettings(),
}));

vi.mock('./ChangePasswordForm', () => ({
  ChangePasswordForm: () => (
    <div data-testid="change-password-form">ChangePasswordForm Component</div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <div
      data-testid="select"
      data-value={value}
      data-on-change={Boolean(onValueChange)}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label?: string;
  }) => (
    <div data-testid="select-trigger" data-label={label}>
      {children}
    </div>
  ),
  SelectValue: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-value">{children}</div>
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
  }) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
}));

describe('SettingsContent', () => {
  const defaultSettingsReturn = {
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.theme': 'Theme',
        'settings.themes.light': 'Light',
        'settings.themes.dark': 'Dark',
        'settings.themes.system': 'System',
        'settings.language': 'Language',
        'settings.changePassword': 'Change Password',
      };
      return translations[key] || key;
    },
    theme: 'light',
    themeLabels: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    languages: [
      { value: 'en', label: 'English' },
      { value: 'ru', label: 'Russian' },
    ],
    language: 'en',
    handleThemeChange: mockHandleThemeChange,
    handleLanguageChange: mockHandleLanguageChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettings.mockReturnValue(defaultSettingsReturn);
  });

  it('should render theme selector, language selector, change password title, and ChangePasswordForm', () => {
    render(<SettingsContent />);

    const selectTriggers = screen.getAllByTestId('select-trigger');
    expect(selectTriggers).toHaveLength(2);
    expect(selectTriggers[0]?.getAttribute('data-label')).toBe('Theme');
    expect(selectTriggers[1]?.getAttribute('data-label')).toBe('Language');

    expect(screen.getByText('Change Password')).toBeDefined();
    expect(screen.getByTestId('change-password-form')).toBeDefined();
  });

  it('should correctly display current selected theme and language values', () => {
    render(<SettingsContent />);

    const selectValues = screen.getAllByTestId('select-value');
    expect(selectValues[0]?.textContent).toBe('Light');
    expect(selectValues[1]?.textContent).toBe('English');
  });
});
