'use client';

import React, { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type DeleteCountDialogProps = {
  title: string;
  description: string;
  onConfirm: () => boolean | Promise<boolean> | void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmDisabled?: boolean;
  t: (key: string) => string;
};

export function DeleteCountDialog({
  title,
  description,
  onConfirm,
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  confirmDisabled = false,
  t,
}: DeleteCountDialogProps) {
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
    const result = await onConfirm();

    if (result !== false) {
      handleOpenChange(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && (
        <AlertDialogTrigger
          render={<div className="inline-block" />}
          nativeButton={false}
        >
          {trigger}
        </AlertDialogTrigger>
      )}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription className="font-regular text-foreground">
            {description}
          </AlertDialogDescription>

          <AlertDialogCloseButton />
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t('dialogs.common.cancel')}</AlertDialogCancel>

          <AlertDialogAction
            disabled={confirmDisabled}
            onClick={() => void handleConfirm()}
          >
            {t('dialogs.common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
