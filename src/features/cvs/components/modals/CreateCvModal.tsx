import {
  ChangeCvModal,
  ChangeCvModalProps,
} from '@/features/cvs/components/modals/ChangeCvModal';

type CreateCvModalProps = Omit<ChangeCvModalProps, 'type'>;

export function CreateCvModal({ trigger, onSubmit }: CreateCvModalProps) {
  return <ChangeCvModal type="Create" trigger={trigger} onSubmit={onSubmit} />;
}
