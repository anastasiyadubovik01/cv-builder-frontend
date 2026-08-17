import {
  DeleteDialog,
  DeleteDialogProps,
} from '@/components/dialogs/DeleteDialog';

type DeleteCvModalProps = Omit<DeleteDialogProps, 'type'>;

export function DeleteCvModal({ ...props }: DeleteCvModalProps) {
  return <DeleteDialog {...props} itemType="CV" />;
}
