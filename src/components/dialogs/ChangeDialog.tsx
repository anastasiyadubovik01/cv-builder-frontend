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
import { Button } from '@/components/ui/button';
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
  onConfirm: () => void;
  trigger?: React.ReactNode;
  t: (key: string) => string;
}

export function ChangeDialog({
  actionTitle,
  itemType,
  children,
  onConfirm,
  trigger,
  t,
}: ChangeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const translatedItemType = getItemTypeTranslation(itemType, t);
  const translatedAction = getActionTranslation(actionTitle, t);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>{translatedAction}</Button>}>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {translatedAction} {translatedItemType}
          </DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogCancel>{t('dialogs.common.cancel')}</DialogCancel>
          <DialogAction onClick={handleConfirm}>
            {translatedAction}
          </DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
