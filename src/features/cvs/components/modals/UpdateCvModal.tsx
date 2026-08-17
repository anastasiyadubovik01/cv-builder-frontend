import {
  ChangeCvModal,
  type ChangeCvModalProps,
} from '@/features/cvs/components/modals/ChangeCvModal';

type UpdateCvModalProps = Omit<ChangeCvModalProps, 'type'>;

export function UpdateCvModal({ ...props }: UpdateCvModalProps) {
  return <ChangeCvModal {...props} type="Update" />;
}
