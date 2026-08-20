'use client';

import type { ApiLanguage } from '@/api/languages';

import { useUpdateLanguageForm } from '../hooks/useUpdateLanguageForm';
import { ChangeLanguageModal } from './ChangeLanguageModal';

type UpdateLanguageModalProps = {
  language: ApiLanguage;
  languages: ApiLanguage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

export function UpdateLanguageModal({
  language,
  languages,
  open,
  onOpenChange,
  onSuccess,
}: UpdateLanguageModalProps) {
  const form = useUpdateLanguageForm({
    language,
    languages,
    onSuccess,
  });

  return (
    <ChangeLanguageModal
      {...form}
      type="Update"
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
