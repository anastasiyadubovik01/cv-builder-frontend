import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings';

const mockSetTheme = vi.fn();
const mockChangeLanguage = vi.fn();
const mockT = vi.fn((key: string) => `translated_${key}`);

let mockResolvedLanguage: string | undefined = 'en';
let mockLanguage = 'en';

vi.mock('@/providers/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: mockSetTheme,
  }),
}));

vi.mock('next-i18next/client', () => ({
  useT: () => ({
    t: mockT,
    i18n: {
      get language() {
        return mockLanguage;
      },
      get resolvedLanguage() {
        return mockResolvedLanguage;
      },
    },
  }),
  useChangeLanguage: () => mockChangeLanguage,
}));

describe('useSettings hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolvedLanguage = 'en';
    mockLanguage = 'en';
  });

  it('should return correct initial values, theme and languages list', () => {
    const { result } = renderHook(() => useSettings());

    expect(result.current.theme).toBe('dark');
    expect(result.current.language).toBe('en');
    expect(result.current.themeLabels).toEqual({
      light: 'translated_settings.themes.light',
      dark: 'translated_settings.themes.dark',
      system: 'translated_settings.themes.system',
    });
    expect(result.current.languages).toEqual([
      { value: 'en', label: 'English' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'it', label: 'Italian' },
      { value: 'pl', label: 'Polish' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'ru', label: 'Russian' },
      { value: 'es', label: 'Spanish' },
      { value: 'uk', label: 'Ukrainian' },
    ]);
  });

  it('should fallback to i18n.language when resolvedLanguage is undefined', () => {
    mockResolvedLanguage = undefined;
    mockLanguage = 'fr';

    const { result } = renderHook(() => useSettings());

    expect(result.current.language).toBe('fr');
  });

  describe('handleThemeChange', () => {
    it('should successfully change theme when valid theme value is provided', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.handleThemeChange('light');
      });

      expect(mockSetTheme).toHaveBeenCalledTimes(1);
      expect(mockSetTheme).toHaveBeenCalledWith('light');
    });

    it('should not call setTheme when invalid theme value is provided', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.handleThemeChange('neon');
      });

      expect(mockSetTheme).not.toHaveBeenCalled();
    });

    it('should not call setTheme when null is provided', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.handleThemeChange(null);
      });

      expect(mockSetTheme).not.toHaveBeenCalled();
    });
  });

  describe('handleLanguageChange', () => {
    it('should successfully change language when valid language value is provided', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.handleLanguageChange('ru');
      });

      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
      expect(mockChangeLanguage).toHaveBeenCalledWith('ru');
    });

    it('should not call changeLanguage when null or empty value is provided', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.handleLanguageChange(null);
      });

      expect(mockChangeLanguage).not.toHaveBeenCalled();
    });
  });
});
