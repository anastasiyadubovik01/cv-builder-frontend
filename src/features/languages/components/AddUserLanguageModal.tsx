'use client';

import type { ReactNode } from 'react';

import type { ApiLanguage } from '@/api/languages';
import { ChangeUserLanguageModal } from '@/features/languages/components/ChangeUserLanguageModal';
import { useAddUserLanguage } from '@/features/languages/hooks/useAddUserLanguage';

type AddUserLanguageModalProps = {
  userId: string;
  languages: ApiLanguage[];
  trigger: ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export function AddUserLanguageModal({
  userId,
  languages,
  trigger,
  onSuccess,
}: AddUserLanguageModalProps) {
  const form = useAddUserLanguage({
    userId,
    onSuccess,
  });

  return (
    <ChangeUserLanguageModal
      {...form}
      type="Add"
      languages={languages}
      trigger={trigger}
    />
  );
}
