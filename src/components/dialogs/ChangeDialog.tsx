'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogAction,
  DialogCancel,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createActionTitles,
  itemType,
  updateActionTitles,
} from '@/components/dialogs/types';
import {
  getActionTranslation,
  getItemTypeTranslation,
} from '@/components/dialogs/i18n';
import { useTranslation } from 'react-i18next';

interface ChangeDialogProps {
  actionTitle: createActionTitles | updateActionTitles;
  itemType: itemType;
  children: React.ReactNode;
  onConfirm: () => boolean | Promise<boolean>;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmDisabled?: boolean;
  size?: 'default' | 'sm' | 'wide';
}

export function ChangeDialog({
  actionTitle,
  itemType,
  children,
  onConfirm,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  confirmDisabled = false,
  size = 'default',
}: ChangeDialogProps) {
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      externalOnOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  const handleConfirm = async () => {
    const isSuccess = await onConfirm();
    if (isSuccess) {
      handleOpenChange(false);
    }
  };

  const translatedItemType = getItemTypeTranslation(itemType, t);
  const translatedAction = getActionTranslation(actionTitle, t);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <DialogTrigger
          render={<div className="inline-block" />}
          nativeButton={false}
        >
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>
            {translatedAction} {translatedItemType}
          </DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogCancel>{t('dialogs.common.cancel')}</DialogCancel>
          <DialogAction
            onClick={() => void handleConfirm()}
            disabled={confirmDisabled}
          >
            {translatedAction}
          </DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
