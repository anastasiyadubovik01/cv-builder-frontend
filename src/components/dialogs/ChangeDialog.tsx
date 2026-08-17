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

interface ChangeDialogProps {
  actionTitle: createActionTitles | updateActionTitles;
  itemType: itemType;
  children: React.ReactNode;
  onConfirm: () => boolean | Promise<boolean>;
  trigger?: React.ReactNode;
  t: (key: string) => string;
  confirmDisabled?: boolean;
  size?: 'default' | 'sm' | 'wide';
}

export function ChangeDialog({
  actionTitle,
  itemType,
  children,
  onConfirm,
  trigger,
  t,
  confirmDisabled = false,
  size = 'default',
}: ChangeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    const isSuccess = await onConfirm();
    if (isSuccess) {
      setOpen(false);
    }
  };

  const translatedItemType = getItemTypeTranslation(itemType, t);
  const translatedAction = getActionTranslation(actionTitle, t);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger ? <div className="inline-block" /> : undefined}
        nativeButton={false}
      >
        {trigger}
      </DialogTrigger>
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
