import {
  ChangeCvModal,
  ChangeCvModalProps,
} from '@/features/cvs/components/ChangeCvModal';

type UpdateCvModalProps = Omit<ChangeCvModalProps, 'type'>;

export function UpdateCvModal({ trigger, onSubmit }: UpdateCvModalProps) {
  return <ChangeCvModal type="Update" trigger={trigger} onSubmit={onSubmit} />;
}
