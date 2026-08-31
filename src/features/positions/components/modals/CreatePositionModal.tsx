'use client';

import type { ReactNode } from 'react';

import type { Position } from '@/api/positions';

import { ChangePositionModal } from './ChangePositionModal';
import { useCreatePositionForm } from '../../hooks/useCreatePositionForm';

type CreatePositionModalProps = {
  positions: Position[];
  trigger?: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreatePositionModal({
  positions,
  trigger,
  onSuccess,
}: CreatePositionModalProps) {
  const form = useCreatePositionForm({
    positions,
    onSuccess,
  });

  return <ChangePositionModal {...form} type="Create" trigger={trigger} />;
}
