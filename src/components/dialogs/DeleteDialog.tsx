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
import { Button } from '@/components/ui/button';

interface DeleteDialogProps {
  name: string;
  itemType:
    | 'user'
    | 'skill'
    | 'language'
    | 'CV'
    | 'CV Project'
    | 'department'
    | 'position'
    | 'project';
  onConfirm: () => void;
  trigger?: React.ReactNode;
}

export function DeleteDialog({
  name,
  itemType,
  onConfirm,
  trigger,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="destructive">Delete</Button>}
      >
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemType}</AlertDialogTitle>
          <AlertDialogDescription className="font-regular text-foreground">
            Are you sure you want to delete {itemType}{' '}
            <span className="font-bold">{name}</span>?
          </AlertDialogDescription>
          <AlertDialogCloseButton />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
