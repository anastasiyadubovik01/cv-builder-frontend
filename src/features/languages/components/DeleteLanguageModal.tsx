'use client';

import {
  DeleteDialog,
  type DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';

import { useDeleteLanguage } from '../hooks/useDeleteLanguage';

type DeleteLanguageModalProps = Omit<
  DeleteDialogProps,
  'itemType' | 'onConfirm' | 't'
> & {
  languageId: string;
  onSuccess?: () => void | Promise<void>;
};

export function DeleteLanguageModal({
  languageId,
  name,
  onSuccess,
  ...props
}: DeleteLanguageModalProps) {
  const { handleDelete, t } = useDeleteLanguage({
    onSuccess,
  });

  return (
    <DeleteDialog
      {...props}
      name={name}
      itemType="language"
      onConfirm={() => handleDelete(languageId)}
      t={t}
    />
  );
}
