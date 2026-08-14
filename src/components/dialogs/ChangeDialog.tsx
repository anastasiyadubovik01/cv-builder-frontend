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

interface ChangeDialogProps {
  actionTitle: createActionTitles | updateActionTitles;
  itemType: itemType;
  children: React.ReactNode;
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function ChangeDialog({
  actionTitle,
  itemType,
  children,
  onConfirm,
  trigger,
}: ChangeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Open</Button>}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {actionTitle} {itemType}
          </DialogTitle>
          <DialogCloseButton />
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogCancel>Cancel</DialogCancel>
          <DialogAction onClick={handleConfirm}>{actionTitle}</DialogAction>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
