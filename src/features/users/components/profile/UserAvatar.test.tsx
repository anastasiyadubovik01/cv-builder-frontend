import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserAvatar } from './UserAvatar';

const mockUploadAvatar = vi.fn();
const mockOnUpdated = vi.fn().mockResolvedValue(undefined);
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

let mockLoadingState = false;

vi.mock('@apollo/client/react', () => ({
  useMutation: () => [mockUploadAvatar, { loading: mockLoadingState }],
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/sonner', () => ({
  useToast: () => ({
    error: mockToastError,
    success: mockToastSuccess,
  }),
}));

vi.mock('@/lib/helpers/file-to-base64', () => ({
  fileToBase64: vi.fn(),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="avatar" className={className}>
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="avatar-fallback" className={className}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/loading-overlay', () => ({
  LoadingOverlay: () => <div data-testid="loading-overlay" />,
}));

vi.mock('@/components/icons/upload-icon', () => ({
  UploadIcon: () => <div data-testid="upload-icon" />,
}));

describe('UserAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadingState = false;
  });

  it('should render avatar with fallback initial and edit controls when canEdit is true', () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByTestId('avatar')).toBeDefined();
    expect(screen.getByTestId('avatar-fallback').textContent).toBe('J');
    expect(screen.getByText('users.details.avatar.upload')).toBeDefined();
    expect(screen.getByText('users.details.avatar.hint')).toBeDefined();
  });

  it('should handle empty firstName fallback for initial', () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName=""
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByTestId('avatar-fallback').textContent).toBe('');
  });

  it('should not render upload button and input when canEdit is false', () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar="https://example.com/avatar.jpg"
        firstName="Alice"
        lastName="Smith"
        canEdit={false}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByTestId('avatar-image').getAttribute('src')).toBe(
      'https://example.com/avatar.jpg',
    );
    expect(screen.queryByText('users.details.avatar.upload')).toBeNull();
  });

  it('should trigger hidden file input click when upload container button is clicked', () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    const uploadButton = screen.getByRole('button', {
      name: /users\.details\.avatar\.upload/i,
    });
    fireEvent.click(uploadButton);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should do nothing if file selection is empty (no files selected)', async () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [] },
    });

    expect(mockUploadAvatar).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('should show error toast if uploaded file has invalid type', async () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const invalidFile = new File(['dummy content'], 'document.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: { files: [invalidFile] },
    });

    expect(mockToastError).toHaveBeenCalledWith(
      'users.details.avatar.invalidType',
    );
    expect(mockUploadAvatar).not.toHaveBeenCalled();
  });

  it('should show error toast if uploaded file is too large', async () => {
    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const largeContent = new Array(600_000).fill('a').join('');
    const largeFile = new File([largeContent], 'large.png', {
      type: 'image/png',
    });

    fireEvent.change(input, {
      target: { files: [largeFile] },
    });

    expect(mockToastError).toHaveBeenCalledWith(
      'users.details.avatar.tooLarge',
    );
    expect(mockUploadAvatar).not.toHaveBeenCalled();
  });

  it('should successfully upload valid file, call onUpdated and show success toast', async () => {
    const { fileToBase64 } = await import('@/lib/helpers/file-to-base64');
    vi.mocked(fileToBase64).mockResolvedValueOnce('base64stringdata');
    mockUploadAvatar.mockResolvedValueOnce({ data: { uploadAvatar: true } });

    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(['valid content'], 'avatar.png', {
      type: 'image/png',
    });

    fireEvent.change(input, {
      target: { files: [validFile] },
    });

    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith({
        variables: {
          avatar: {
            userId: 'user-1',
            base64: 'base64stringdata',
            size: validFile.size,
            type: 'image/png',
          },
        },
      });
      expect(mockOnUpdated).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith(
        'users.details.avatar.uploadSucces',
      );
    });
  });

  it('should show error toast when upload mutation or conversion fails', async () => {
    const { fileToBase64 } = await import('@/lib/helpers/file-to-base64');
    vi.mocked(fileToBase64).mockResolvedValueOnce('base64stringdata');
    mockUploadAvatar.mockRejectedValueOnce(new Error('Network error'));

    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const validFile = new File(['valid content'], 'avatar.png', {
      type: 'image/png',
    });

    fireEvent.change(input, {
      target: { files: [validFile] },
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        'users.details.avatar.uploadError',
      );
    });
  });

  it('should render loading overlay and uploading text when loading is true', () => {
    mockLoadingState = true;

    render(
      <UserAvatar
        userId="user-1"
        avatar={null}
        firstName="John"
        lastName="Doe"
        canEdit={true}
        onUpdated={mockOnUpdated}
      />,
    );

    expect(screen.getByTestId('loading-overlay')).toBeDefined();
    expect(screen.getByText('users.details.avatar.uploading')).toBeDefined();
  });
});
