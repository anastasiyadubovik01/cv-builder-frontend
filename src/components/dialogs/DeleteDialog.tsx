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
import { itemType } from '@/components/dialogs/types';
import { getItemTypeTranslation } from '@/components/dialogs/i18n';

export interface DeleteDialogProps {
  name: string;
  itemType: itemType;
  onConfirm: () => void;
  trigger?: React.ReactNode;
  t: (key: string) => string;
}

export function DeleteDialog({
  name,
  itemType,
  onConfirm,
  trigger,
  t,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const translatedItemType = getItemTypeTranslation(itemType, t);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={trigger ? <div className="inline-block" /> : undefined}
        nativeButton={false}
      >
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('dialogs.delete.title')}
            {translatedItemType}
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
