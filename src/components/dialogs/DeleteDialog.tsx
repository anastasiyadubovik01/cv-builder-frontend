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
import { deleteActionTitles, itemType } from '@/components/dialogs/types';
import {
  getActionTranslation,
  getItemTypeTranslation,
} from '@/components/dialogs/i18n';

export interface DeleteDialogProps {
  name: string;
  itemType: itemType;
  actionTitle?: deleteActionTitles;
  onConfirm: () => boolean | Promise<boolean> | void;
  trigger?: React.ReactNode;
  t: (key: string) => string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteDialog({
  name,
  itemType,
  actionTitle = 'Delete',
  onConfirm,
  trigger,
  t,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: DeleteDialogProps) {
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

  const translatedItemType = getItemTypeTranslation(itemType, t);
  const translatedAction = getActionTranslation(actionTitle, t);

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
          <AlertDialogTitle>
            {translatedAction} {translatedItemType}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-regular text-foreground">
            {t('dialogs.delete.description')} {translatedItemType}{' '}
            <span className="font-bold">{name}</span>
            {'?'}
          </AlertDialogDescription>
          <AlertDialogCloseButton />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('dialogs.common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {t('dialogs.common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
