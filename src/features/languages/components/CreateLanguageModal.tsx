'use client';

import type { ReactNode } from 'react';

import type { ApiLanguage } from '@/api/languages';

import { ChangeLanguageModal } from './ChangeLanguageModal';
import { useCreateLanguageForm } from '../hooks/useCreateLanguageForm';

type CreateLanguageModalProps = {
  languages: ApiLanguage[];
  trigger?: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function CreateLanguageModal({
  languages,
  trigger,
  onSuccess,
}: CreateLanguageModalProps) {
  const form = useCreateLanguageForm({
    languages,
    onSuccess,
  });

  return <ChangeLanguageModal {...form} type="Create" trigger={trigger} />;
}
