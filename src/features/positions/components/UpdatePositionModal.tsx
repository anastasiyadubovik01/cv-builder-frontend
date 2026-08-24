'use client';

import type { Position } from '@/api/positions';

import { useUpdatePositionForm } from '../hooks/useUpdatePositionForm';
import { ChangePositionModal } from './ChangePositionModal';

type UpdatePositionModalProps = {
  position: Position;
  positions: Position[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdatePositionModal({
  position,
  positions,
  open,
  onOpenChange,
  onSuccess,
}: UpdatePositionModalProps) {
  const form = useUpdatePositionForm({
    position,
    positions,
    onSuccess,
  });

  return (
    <ChangePositionModal
      {...form}
      type="Update"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
