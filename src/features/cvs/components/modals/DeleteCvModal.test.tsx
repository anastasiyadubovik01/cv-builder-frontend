import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteCv } from '@/features/cvs/hooks/useDeleteCv';
import { DeleteDialog } from '@/components/dialogs/DeleteDialog';

import { DeleteCvModal } from './DeleteCvModal';

vi.mock('@/features/cvs/hooks/useDeleteCv', () => ({
  useDeleteCv: vi.fn(),
}));

vi.mock('@/components/dialogs/DeleteDialog', () => ({
  DeleteDialog: vi.fn(
    ({
      name,
      itemType,
      onConfirm,
      trigger,
      open,
      onOpenChange,
    }: {
      name?: string;
      itemType: string;
      onConfirm: () => Promise<boolean>;
      trigger?: ReactNode;
      open?: boolean;
      onOpenChange?: (open: boolean) => void;
    }) => (
      <div
        data-testid="delete-dialog"
        data-name={name}
        data-item-type={itemType}
        data-open={String(open)}
      >
        {trigger}

        <button type="button" onClick={() => void onConfirm()}>
          Confirm delete
        </button>

        <button type="button" onClick={() => onOpenChange?.(false)}>
          Close
        </button>
      </div>
    ),
  ),
}));

describe('DeleteCvModal', () => {
  const handleDelete = vi.fn();
  const onSuccess = vi.fn();
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useDeleteCv).mockReturnValue({
      handleDelete,
      loading: false,
    } as never);

    handleDelete.mockResolvedValue(true);
    onSuccess.mockResolvedValue(undefined);
  });

  it('uses delete CV hook', () => {
    render(<DeleteCvModal cvId="cv-1" name="Frontend CV" />);

    expect(useDeleteCv).toHaveBeenCalledTimes(1);
  });

  it('passes CV configuration to DeleteDialog', () => {
    render(
      <DeleteCvModal
        cvId="cv-1"
        name="Frontend CV"
        open
        onOpenChange={onOpenChange}
        trigger={<button>Delete CV</button>}
      />,
    );

    expect(DeleteDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Frontend CV',
        itemType: 'CV',
        open: true,
        onOpenChange,
        trigger: expect.anything(),
        onConfirm: expect.any(Function),
      }),
      undefined,
    );

    const dialog = screen.getByTestId('delete-dialog');

    expect(dialog).toHaveAttribute('data-name', 'Frontend CV');

    expect(dialog).toHaveAttribute('data-item-type', 'CV');
  });

  it('deletes CV by id', async () => {
    render(<DeleteCvModal cvId="cv-1" name="Frontend CV" />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm delete',
      }),
    );

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledWith('cv-1');
    });
  });

  it('calls onSuccess after successful deletion', async () => {
    handleDelete.mockResolvedValue(true);

    render(
      <DeleteCvModal cvId="cv-1" name="Frontend CV" onSuccess={onSuccess} />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm delete',
      }),
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onSuccess when deletion fails', async () => {
    handleDelete.mockResolvedValue(false);

    render(
      <DeleteCvModal cvId="cv-1" name="Frontend CV" onSuccess={onSuccess} />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Confirm delete',
      }),
    );

    await waitFor(() => {
      expect(handleDelete).toHaveBeenCalledTimes(1);
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('returns successful delete result from onConfirm', async () => {
    handleDelete.mockResolvedValue(true);

    render(<DeleteCvModal cvId="cv-1" name="Frontend CV" />);

    const props = vi.mocked(DeleteDialog).mock.calls[0][0];

    const result = await props.onConfirm();

    expect(result).toBe(true);
  });

  it('returns failed delete result from onConfirm', async () => {
    handleDelete.mockResolvedValue(false);

    render(<DeleteCvModal cvId="cv-1" name="Frontend CV" />);

    const props = vi.mocked(DeleteDialog).mock.calls[0][0];

    const result = await props.onConfirm();

    expect(result).toBe(false);
  });

  it('works without optional onSuccess', async () => {
    render(<DeleteCvModal cvId="cv-1" name="Frontend CV" />);

    const props = vi.mocked(DeleteDialog).mock.calls[0][0];

    await expect(props.onConfirm()).resolves.toBe(true);
  });

  it('passes remaining dialog props', () => {
    render(
      <DeleteCvModal
        cvId="cv-1"
        name="Frontend CV"
        open
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close',
      }),
    );

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
