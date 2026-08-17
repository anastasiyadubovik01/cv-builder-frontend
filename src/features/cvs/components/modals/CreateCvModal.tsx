import {
  ChangeCvModal,
  type ChangeCvModalProps,
} from '@/features/cvs/components/modals/ChangeCvModal';

type CreateCvModalProps = Omit<ChangeCvModalProps, 'type'>;

export function CreateCvModal({ ...props }: CreateCvModalProps) {
  return <ChangeCvModal {...props} type="Create" />;
}
