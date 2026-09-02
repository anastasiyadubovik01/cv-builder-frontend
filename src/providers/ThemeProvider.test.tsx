import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeProvider';

describe('ThemeProvider', () => {
  let isDarkSystemTheme = false;
  let mediaChangeHandler: (() => void) | undefined;

  const addEventListener = vi.fn((event: string, handler: () => void) => {
    if (event === 'change') {
      mediaChangeHandler = handler;
    }
  });

  const removeEventListener = vi.fn();

  function ThemeConsumer() {
    const { theme, setTheme } = useTheme();

    return (
      <div>
        <span data-testid="theme">{theme}</span>

        <button onClick={() => setTheme('light')}>Light</button>

        <button onClick={() => setTheme('dark')}>Dark</button>

        <button onClick={() => setTheme('system')}>System</button>
      </div>
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();
    document.documentElement.classList.remove('dark');

    isDarkSystemTheme = false;
    mediaChangeHandler = undefined;

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        get matches() {
          return isDarkSystemTheme;
        },
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addEventListener,
        removeEventListener,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('uses system theme by default', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('loads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    expect(document.documentElement).toHaveClass('dark');
  });

  it('falls back to system for invalid saved theme', () => {
    localStorage.setItem('theme', 'invalid-theme');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
  });

  it('sets dark theme and saves it to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Dark' }));

    expect(localStorage.getItem('theme')).toBe('dark');

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    expect(document.documentElement).toHaveClass('dark');
  });

  it('removes dark class for light theme', async () => {
    localStorage.setItem('theme', 'dark');

    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass('dark');

    await user.click(screen.getByRole('button', { name: 'Light' }));

    expect(localStorage.getItem('theme')).toBe('light');

    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('uses dark class when system theme is dark', () => {
    isDarkSystemTheme = true;

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');

    expect(document.documentElement).toHaveClass('dark');
  });

  it('reacts to system theme changes', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    expect(document.documentElement).not.toHaveClass('dark');

    isDarkSystemTheme = true;

    act(() => {
      mediaChangeHandler?.();
    });

    expect(document.documentElement).toHaveClass('dark');

    isDarkSystemTheme = false;

    act(() => {
      mediaChangeHandler?.();
    });

    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('does not listen for system changes when explicit theme is selected', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it('removes system theme listener on unmount', () => {
    const { unmount } = render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('updates theme after storage event', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');

    act(() => {
      localStorage.setItem('theme', 'dark');
      window.dispatchEvent(new Event('storage'));
    });

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');

    expect(document.documentElement).toHaveClass('dark');
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    function InvalidConsumer() {
      useTheme();
      return null;
    }

    expect(() => {
      render(<InvalidConsumer />);
    }).toThrow('useTheme must be used inside ThemeProvider');
  });
});
